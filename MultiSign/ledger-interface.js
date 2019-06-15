require("babel-polyfill");
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const AppBtc = require("@ledgerhq/hw-app-btc").default;

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

  const finalTx = bitcore.Transaction.fromString(raw);
  for (const signature of signatureObjs) {
    finalTx.applySignature(signature);
  }

  return finalTx.toString("hex");
}

module.exports = {
  getPublicKey,
  sign
};
