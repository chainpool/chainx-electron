require("babel-polyfill");
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const AppBtc = require("@ledgerhq/hw-app-btc").default;
const bitcoinjs = require("bitcoinjs-lib");

const bitcore = require("bitcore-lib");
const mainnetPath = "m/45'/0'/0'/0/0";
const testnetPath = "m/45'/1'/0'/0/0";

async function getPublicKey(network = "mainnet") {
  const transport = await TransportNodeHid.open("");
  const btc = new AppBtc(transport);

  const path = network === "mainnet" ? mainnetPath : testnetPath;

  const result = await btc.getWalletPublicKey(path);
  const compressed = btc.compressPublicKey(
    Buffer.from(result.publicKey, "hex")
  );

  return compressed.toString("hex");
}

function constructTxObj(raw, inputArr, redeemScript, network = "mainnet") {
  const net =
    network === "mainnet" ? bitcore.Networks.mainnet : bitcore.Networks.testnet;

  const txObj = bitcore.Transaction();

  const utxos = inputArr.map(input => {
    const tx = bitcore.Transaction(input.raw);
    const script = tx.outputs[input.index].script.toHex();
    return {
      txId: input.hash,
      outputIndex: input.index,
      address: input.address,
      script,
      satoshis: input.satoshi
    };
  });

  const script = bitcore.Script.fromString(redeemScript);
  const chunks = script.chunks.slice(1, script.chunks.length - 2);
  const pubkeys = chunks.map(chunk => chunk.buf.toString("hex"));
  const m = script.chunks[0].opcodenum - 80;

  for (let utxo of utxos) {
    txObj.from(utxo, pubkeys, m, false, { noSorting: true });
  }

  const originTx = bitcore.Transaction(raw);
  for (const output of originTx.outputs) {
    const address = bitcore.Address.fromScript(output.script, net);

    txObj.to(address.toString(), output.satoshis);
  }
  applyAlreadyExistedSig(txObj, raw, network);

  return txObj;
}

function applyAlreadyExistedSig(txObj, raw, network) {
  const tx = bitcoinjs.Transaction.fromHex(raw);
  const txb = bitcoinjs.TransactionBuilder.fromTransaction(
    tx,
    network === "mainnet"
      ? bitcoinjs.networks.bitcoin
      : bitcoinjs.networks.testnet
  );

  console.log(txb.__inputs);
  txb.__inputs.forEach((input, index) => {
    if (!input.pubkeys) {
      return;
    }

    const pubkyes = input.pubkeys.map(key => key.toString("hex"));
    input.signatures.forEach((sig, sigIdx) => {
      if (typeof sig === "undefined") {
        return;
      }

      const pubkey = pubkyes[sigIdx];
      const obj = {
        inputIndex: index,
        signature: bitcore.crypto.Signature.fromBuffer(sig, false),
        sigtype: bitcore.crypto.Signature.SIGHASH_ALL,
        publicKey: bitcore.PublicKey(pubkey, {
          network:
            network === "mainnet"
              ? bitcore.Networks.mainnet
              : bitcore.Networks.testnet,
          compressed: true
        })
      };

      txObj.applySignature(obj);
    });
  });
}

async function sign(raw, inputsObj, redeemScript, pubkey, network = "mainnet") {
  const transport = await TransportNodeHid.open("");
  const btc = new AppBtc(transport);

  const toSignInputs = inputsObj.map(({ raw, index }) => {
    const tx = btc.splitTransaction(raw);
    return [tx, index, redeemScript];
  });

  const outputScript = btc
    .serializeTransactionOutputs(btc.splitTransaction(raw))
    .toString("hex");

  const path = network === "mainnet" ? mainnetPath : testnetPath;
  const result = await btc.signP2SHTransaction(
    toSignInputs,
    [path],
    outputScript
  );

  const signatureObjs = result.map(function(sig, index) {
    return {
      inputIndex: index,
      signature: bitcore.crypto.Signature.fromString(sig),
      sigtype: bitcore.crypto.Signature.SIGHASH_ALL,
      publicKey: bitcore.PublicKey(pubkey, {
        network:
          network === "mainnet"
            ? bitcore.Networks.mainnet
            : bitcore.Networks.testnet,
        compressed: true
      })
    };
  });

  const finalTx = constructTxObj(raw, inputsObj, redeemScript, network);
  for (const signature of signatureObjs) {
    finalTx.applySignature(signature);
  }

  return finalTx.toString("hex");
}

module.exports = {
  getPublicKey,
  sign
};
