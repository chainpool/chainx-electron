require("babel-polyfill");

const TransportNodeHid = require("@ledgerhq/hw-transport-node-hid");
const AppBtc = require("@ledgerhq/hw-app-btc").default;

// const bitcore = require("bitcore-lib");
// // const Script = bitcore.Script;
//
// async function pub(btc, path) {
//   const result = await btc.getWalletPublicKey(path);
//   console.log(result);
//   const compressed = btc.compressPublicKey(
//     Buffer.from(result.publicKey, "hex")
//   );
//
//   console.log("compressed:", compressed.toString("hex"), path);
//   return compressed.toString("hex");
// }

// async function createP2sh(pubs) {
//   const multiSignAddr = new bitcore.Address(pubs, 2, bitcore.Networks.testnet);
//   let redeemScript = Script.buildMultisigOut(pubs, 2);
//
//   console.log("multiSignAddr", multiSignAddr.toString());
//
//   return [multiSignAddr.toString(), redeemScript.toHex()];
// }
//
// function construct() {
//   const txObj = bitcore.Transaction();
//
//   const utxo = {
//     txId: "7661b30c1876fa5ae425a609298c2f429d5ac9fe7c5ba0d0209e4359851bdfd7",
//     outputIndex: 0,
//     address: "2NAjyY8seaETvW8EGohYi8qtXM2jBWJzo93",
//     script: "a914bfea23666aa0cf6e3173046d26373f94913cfbdc87",
//     satoshis: 1900000
//   };
//
//   const pubkeys = [
//     "02a398b4287c7627fde17baa0a5f790d9e2379c48add862ec84a87fa1a31f48db4",
//     "0325e8eb932c0d6c1ba37e6dd357e81c72c2aab1d56554f2fc2f0a413a7e8048c2"
//   ];
//
//   txObj.from(utxo, pubkeys, 2);
//
//   txObj.to("2NAjyY8seaETvW8EGohYi8qtXM2jBWJzo93", 180000);
//
//   return txObj;
// }

// function getOutputScript(btc, raw) {
//   const tx1 = btc.splitTransaction(raw);
//   const outputScript = btc.serializeTransactionOutputs(tx1).toString("hex");
//   console.log("outputScript", outputScript);
//   return outputScript;
// }
//
// async function signP2sh(btc, redeemScript, outputScript) {
//   const tx1 = btc.splitTransaction(
//     "0200000002e3bc01c18fb8e1c71740eea9deb68af7ae06a3238a10b38c8ab165a2a8ed640000000000da00473044022066214f99f2ce6b076d7e55563da00d2a9710fca5909ebe95f27dfc3228bea78a02206f5b7be334dabe2f5680857e951ebf5c43cd5011b602323d953b57a5b022cf8e01483045022100d1d48ae3443ecfe4bbf7b470c8820eaca1573fd21c57bb562d5e131ecf06bd8b02206cad7929b75cb63d2a9625da2891090160ce8f0f0bf888c17949e7e12160eb360147522102a398b4287c7627fde17baa0a5f790d9e2379c48add862ec84a87fa1a31f48db4210325e8eb932c0d6c1ba37e6dd357e81c72c2aab1d56554f2fc2f0a413a7e8048c252aeffffffff0d89fb4ec75f838d074cfffc41bb887b14e9959908cbc43ee55ba65f54d0360b01000000db00483045022100ebc6de68fe878e65bcbec8650e4123515b0c3742ff4751b3d4790db210cd83800220313e2894dd49dd02893cad742a315c02b6277b246036cbe5cccd04d3c6e6bac3014830450221008240dffd9209f22cc5cffa82f46d39e12cd22118b16da93837fd47879b6341ff022032cb3dea53797dc559b3122578cc777be08c1e3aaa2826c9d5af78dede1800bb0147522102a398b4287c7627fde17baa0a5f790d9e2379c48add862ec84a87fa1a31f48db4210325e8eb932c0d6c1ba37e6dd357e81c72c2aab1d56554f2fc2f0a413a7e8048c252aeffffffff01e0fd1c000000000017a914bfea23666aa0cf6e3173046d26373f94913cfbdc8700000000"
//   );
//   const result = await btc.signP2SHTransaction(
//     [[tx1, 0, redeemScript]],
//     ["44'/1'/0'/0/0", "44'/1'/0'/0/1"],
//     outputScript
//   );
//
//   console.log(result);
//   return result;
// }

// exports.example = async () => {
//   const transport = await TransportNodeHid.open("");
//   // transport.setDebugMode(true);
//   const btc = new AppBtc(transport);
//   const compressed0 = await pub(btc, "44'/1'/0'/0/0");
//   const compressed1 = await pub(btc, "44'/1'/0'/0/1");
//
//   const [address, redeemScript] = await createP2sh([compressed0, compressed1]);
//
//   const txObj = construct();
//   const outputScript = getOutputScript(btc, txObj.toString("hex"));
//   //
//   const result = await signP2sh(btc, redeemScript, outputScript);
//   console.log(result);
//
//   let s1 = {
//     inputIndex: 0,
//     outputIndex: 0,
//     prevTxId:
//       "7661b30c1876fa5ae425a609298c2f429d5ac9fe7c5ba0d0209e4359851bdfd7",
//     signature: bitcore.crypto.Signature.fromString(result[0]),
//     sigtype: bitcore.crypto.Signature.SIGHASH_ALL,
//     publicKey: bitcore.PublicKey(compressed0, {
//       network: bitcore.Networks.testnet,
//       compressed: true
//     })
//   };
//
//   // const valid = txObj.isValidSignature(s1)
//
//   txObj.applySignature(s1);
//
//   console.log(txObj.toString("hex"));
//
//   // const inputs = [
//   //   ["bf9b6774c966e44ba7d8aa65395f0fa1f82776b498bfbf6164ebc02540eee3b5", 1]
//   // ];
//   //
//   // const associatedKeysets = ["44'/1'/0'/0/0"]
//   // const outputScriptHex = "01905f0100000000001976a91472a5d75c8d2d0565b656a5232703b167d50d5a2b88ac";
//   // const createResult = await appBtc.createPaymentTransactionNew(inputs, associatedKeysets, undefined, outputScriptHex, 0)
//   // console.log(createResult)
// };

// example().then(
//   result => {
//     console.log(result);
//   },
//   e => {
//     console.error(e);
//   }
// );
