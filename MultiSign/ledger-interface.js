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

function constructTxObj(raw, inputArr, redeemScript, m, network = "mainnet") {
  const net =
    network === "mainnet" ? bitcore.Networks.mainnet : bitcore.Networks.testnet;

  const txObj = bitcore.Transaction();

  const utxos = inputArr.map(input => {
    const tx = bitcore.Transaction(input.raw);
    const script = tx.outputs[index].script.toHex();
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

  for (let utxo of utxos) {
    txObj.from(utxo, pubkeys, m, false, { noSorting: true });
  }

  const originTx = bitcore.Transaction(raw);
  for (const ouput of originTx.outputs) {
    const address = bitcore.Address.fromScript(ouput.script, net);

    txObj.to(address.toString(), output.satoshis);
  }

  return txObj;
}

async function sign(
  raw,
  inputsObj,
  redeemScript,
  pubkey,
  m = 2,
  network = "mainnet"
) {
  console.log("arguments", arguments);

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

  console.log("result", result);

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

  console.log(signatureObjs);

  const finalTx = constructTxObj(raw, inputsObj, redeemScript, m, network);
  for (const signature of signatureObjs) {
    finalTx.applySignature(signature);
  }

  return finalTx.toString("hex");
}

module.exports = {
  getPublicKey,
  sign
};
