require("babel-polyfill");
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const AppBtc = require("@ledgerhq/hw-app-btc").default;

async function getPublicKey(network = "mainnet") {
  const transport = await TransportNodeHid.open("");
  const btc = new AppBtc(transport);

  const path = network === "mainnet" ? "m/45'/0'/0'/0/0" : "m/45'/1'/0'/0/0";

  const result = await btc.getWalletPublicKey(path);
  const compressed = btc.compressPublicKey(
    Buffer.from(result.publicKey, "hex")
  );

  return compressed.toString("hex");
}

module.exports = {
  getPublicKey
};
