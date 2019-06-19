const bitcoin = require("bitcoinjs-lib");

module.exports.getRedeemScriptFromRaw = (raw, network = "mainnet") => {
  const tx = bitcoin.Transaction.fromHex(raw);
  const txb = bitcoin.TransactionBuilder.fromTransaction(
    tx,
    network === "main" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
  );

  if (txb.__inputs[0].redeemScript) {
    return txb.__inputs[0].redeemScript.toString("hex");
  }

  return null;
};
