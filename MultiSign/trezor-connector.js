const EventEmitter = require("events");
const trezor = require("trezor.js");
const bitcoin = require("bitcoinjs-lib-zcash");
const bs58check = require("bs58check");
const { getPubKeysFromRedeemScript } = require("./bitcoin-utils");
const bitcore = require("bitcore-lib");

const hardeningConstant = 0x80000000;
const mainnetPath = [
  (45 | hardeningConstant) >>> 0,
  (0 | hardeningConstant) >>> 0,
  (0 | hardeningConstant) >>> 0,
  0,
  0
];
const testnetPath = [
  (45 | hardeningConstant) >>> 0,
  (1 | hardeningConstant) >>> 0,
  (0 | hardeningConstant) >>> 0,
  0,
  0
];

function getSignatures(txb, pubs) {
  if (txb.inputs[0].signatures) {
    return txb.inputs[0].signatures.map(sig => {
      return sig ? sig.toString("hex") : "";
    });
  }
  return pubs.map(() => "");
}

function constructMultisig(
  pubKeys,
  devicePubKey,
  deviceXpub,
  signatures,
  m,
  network = "mainnet"
) {
  const net =
    network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  function getNode(xpub) {
    const hd = bitcoin.HDNode.fromBase58(xpub, net);
    return {
      depth: hd.depth,
      child_num: hd.index,
      fingerprint: hd.parentFingerprint,
      public_key: hd.keyPair.getPublicKeyBuffer().toString("hex"),
      chain_code: hd.chainCode.toString("hex")
    };
  }

  function getDefaultXpub(pub) {
    const chaincode = Buffer.from(
      "0000000000000000000000000000000000000000000000000000000000000000",
      "hex"
    );

    const buffer = Buffer.allocUnsafe(78);
    buffer.writeUInt32BE(net.bip32.public, 0);
    buffer.writeUInt8(0, 4);
    buffer.writeUInt32BE(0x00000000, 5);
    buffer.writeUInt32BE(0x00000000, 9);
    chaincode.copy(buffer, 13);
    Buffer.from(pub, "hex").copy(buffer, 45);

    return bs58check.encode(buffer);
  }

  const nonDevicePubs = pubKeys.filter(pub => pub !== devicePubKey);
  const pubkeys = nonDevicePubs.map(pub => {
    return {
      node: getNode(getDefaultXpub(pub)),
      address_n: []
    };
  });

  pubkeys.push({ node: getNode(deviceXpub), address_n: [] });

  return {
    pubkeys,
    signatures,
    m
  };
}

function constructInputs(tx, multisig, network = "mainnet") {
  return tx.ins.map(input => {
    return {
      address_n: network === "mainnet" ? mainnetPath : testnetPath,
      script_type: "SPENDMULTISIG",
      prev_index: input.index,
      prev_hash: reverse(input.hash).toString("hex"),
      multisig
    };
  });
}

function constructOutputs(raw, network = "mainnet") {
  const tx = bitcore.Transaction(raw);
  const net =
    network === "mainnet" ? bitcore.Networks.mainnet : bitcore.Networks.testnet;
  return tx.outputs.map(output => {
    const address = bitcore.Address.fromScript(output.script, net).toString();
    return {
      amount: output.satoshis,
      address,
      script_type: "PAYTOADDRESS"
    };
  });
}

function bjsTx2refTx(tx) {
  const extraData = tx.getExtraData();
  return {
    lock_time: tx.locktime,
    version: tx.isDashSpecialTransaction()
      ? tx.version | (tx.dashType << 16)
      : tx.version,
    hash: tx.getId(),
    inputs: tx.ins.map(function(input) {
      return {
        prev_index: input.index,
        sequence: input.sequence,
        prev_hash: reverse(input.hash).toString("hex"),
        script_sig: input.script.toString("hex")
      };
    }),
    bin_outputs: tx.outs.map(function(output) {
      return {
        amount: output.value,
        script_pubkey: output.script.toString("hex")
      };
    }),
    extra_data: extraData ? extraData.toString("hex") : null,
    version_group_id: tx.isZcashTransaction()
      ? parseInt(tx.versionGroupId, 16)
      : null
  };
}

function constructPreTxs(inputsArr) {
  return inputsArr
    .map(input => bitcoin.Transaction.fromHex(input.raw))
    .map(bjsTx2refTx);
}

class TrezorConnector extends EventEmitter {
  constructor(pinCallback, buttonCallback) {
    super();

    this.list = new trezor.DeviceList({ debug: false });
    this.pinCallback = pinCallback;
    this.buttonCallback = buttonCallback;
    this.list.on("connect", device => {
      // FIXME: 这里没有考虑多个设备的情况
      this.device = device;
      this.emit("connect", device);

      device.on("disconnect", () => {
        this.device = null;
        this.emit("disconnect");
      });

      device.on("button", code => {
        if (this.buttonCallback) {
          this.buttonCallback(device.features.label, code);
        }

        this.emit("button", code);
      });

      device.on("pin", (type, callback) => {
        if (this.pinCallback) {
          this.pinCallback(type, callback);
        }

        this.emit("pin", type, callback);
      });
    });
  }

  async getDeviceXpub(network = "mainnet") {
    const coin = network === "mainnet" ? "bitcoin" : "testnet";
    const path = network === "mainnet" ? mainnetPath : testnetPath;
    const result = await this.device.waitForSessionAndRun(function(session) {
      return session.getPublicKey(path, coin);
    });

    return [result.message.node.public_key, result.message.xpub];
  }

  async getMultisigObj(txb, redeemScript, network = "mainnet") {
    const [devicePubKey, deviceXpub] = await this.getDeviceXpub(network);
    const [m, pubs] = getPubKeysFromRedeemScript(redeemScript);
    const signatures = getSignatures(txb, pubs);
    return constructMultisig(
      pubs,
      devicePubKey,
      deviceXpub,
      signatures,
      m,
      network
    );
  }

  async sign(raw, inputsArr, redeemScript, network = "mainnet") {
    if (!this.device) {
      throw new Error("No device");
    }

    const transaction = bitcoin.Transaction.fromHex(raw);
    const txb = bitcoin.TransactionBuilder.fromTransaction(
      transaction,
      network === "mainnet"
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet
    );

    const multisig = await this.getMultisigObj(txb, redeemScript, network);
    const inputs = constructInputs(transaction, multisig, network);
    const outputs = constructOutputs(raw, network);
    const txs = constructPreTxs(inputsArr);

    const signResult = await this.device.waitForSessionAndRun(function(
      session
    ) {
      return session.signTx(
        inputs,
        outputs,
        txs,
        network === "mainnet" ? "bitcoin" : "testnet"
      );
    });

    return signResult;
  }
}

module.exports = TrezorConnector;
