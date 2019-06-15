require("babel-polyfill");
const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid").default;
const AppBtc = require("@ledgerhq/hw-app-btc").default;

const chainCodes = {
  mainnet: "d9eff704dddc7052c10e84694886f069a658d9cb70de5cec1c9222d0c47245b4",
  testnet: "2824147de405785f5d62fdcf9fc84a0d89dac75bd0c110029f53a266d7783aa7"
};

async function getPublicKey(network = "mainnet") {
  const transport = await TransportNodeHid.open("");
  const btc = new AppBtc(transport);

  const path = network === "mainnet" ? "m/45'/0'/0'/0/0" : "m/45'/1'/0'/0/0";

  const result = await btc.getWalletPublicKey(path);
  if (chainCodes[network] !== result.chainCode) {
    throw new Error("invalid network");
  }

  const compressed = btc.compressPublicKey(
    Buffer.from(result.publicKey, "hex")
  );

  return compressed.toString("hex");
}

module.exports = {
  getPublicKey
};
