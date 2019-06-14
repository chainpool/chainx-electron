import React from 'react';

import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import AppBtc from '@ledgerhq/hw-app-btc';

import bitcore from 'bitcore-lib';

const Script = bitcore.Script;

console.log(bitcore);

let transport;
let btc;

async function init() {
  transport = await TransportWebUSB.create();
  btc = new AppBtc(transport);
}

// const bitcore = require("bitcore-lib");
// const Script = bitcore.Script;

async function getPublicKey(path) {
  if (!btc) {
    await init();
  }

  const result = await btc.getWalletPublicKey(path);
  console.log(result);
  const compressed = btc.compressPublicKey(Buffer.from(result.publicKey, 'hex'));
  return compressed.toString('hex');
}

async function createP2sh() {
  const pub1 = await getPublicKey("m/45'/1'/0'/0/0");
  const pub2 = await getPublicKey("m/45'/1'/0'/0/1");
  const pubs = [pub1, pub2];

  let redeemScript = Script.buildMultisigOut(pubs, 2, { noSorting: true });
  const multiSignAddr = bitcore.Address.payingTo(redeemScript, bitcore.Networks.testnet);

  console.log('multiSignAddr', multiSignAddr.toString());

  return [multiSignAddr.toString(), redeemScript.toHex()];
}

async function construct() {
  const txObj = bitcore.Transaction();

  const utxo = {
    txId: 'ea0134e4a19ed0cc405f4d6d03ff3860a43ba9f2ea8344ebc7c0b420fc0095a8',
    outputIndex: 0,
    address: '2N6gTTA9YuchRDT9qNiUBuLvSordc7wM8qK',
    script: 'a914935f45db3b36484bd2fe4d231645beaaa6849e1487',
    satoshis: 2500000,
  };

  const pub1 = await getPublicKey("m/45'/1'/0'/0/0");
  const pub2 = await getPublicKey("m/45'/1'/0'/0/1");

  const pubs = [pub1, pub2].map(pub => pub.toString('hex'));

  txObj.from(utxo, pubs, 2, false, { noSorting: true });

  txObj.to('2N6gTTA9YuchRDT9qNiUBuLvSordc7wM8qK', 2400000);

  return txObj;
}

async function signP2sh(btc, redeemScript, outputScript) {
  const tx1 = btc.splitTransaction(
    '0200000003fc1a2589ba6b5671ea60ccb5ecbd09c6165c3847cef955afee271bd4e236299600000000d900473044022038fc184924a89b1eae2d5ffe419e1a44f942813c42e6b49b70740e1e7613e45702206d551e2ad228fa0ab35acd42de525a5914416e437c30fd2cb5425fc5e82e2ebf01473044022046b2029fe49f030584c9927a190dd1a78318d285db5e45895ef1dd839ca6901d02200673f57a04b1093c790f1e34980e83616fcaca9035d15f425ab22642bb25620b01475221035b8fb240f808f4d3d0d024fdf3b185b942e984bba81b6812b8610f66d59f3a84210332bcdca962953288be91cf480f41ae1ff2c97c7ff6d2875275d8254936eeb89852aeffffffffcf25e4acdab8a1c4b6b0325c25ef4743c17f2249b976d206eb715d0ca973d02d00000000da004730440220431bcb34176fca5999d1dbbe8d6a710b3a84b5ceffcbad86fa8af4377d7388650220626e446db4b37b57f64a379b35b569eef6ae349594d343d3c091d0ffc1cedd450148304502210085141e20ecd494164274593bff4d15bb4e648283e4cc81484e1c22f9d5bf41a002202e53b0bb0332153c334e0b15807f42f2c007215c39bf68e0b2de09528411374501475221035b8fb240f808f4d3d0d024fdf3b185b942e984bba81b6812b8610f66d59f3a84210332bcdca962953288be91cf480f41ae1ff2c97c7ff6d2875275d8254936eeb89852aeffffffff60d5aef4ccc0d3417a414bff68bbf79dd35fda55a67775e2c0b270cf1cc306f700000000da00483045022100c9a8e1a5283c17a7f3e5d03f65079d558084e8d353697cdcd66b813c3c3a1f2502207ab75fbec14b348fe1992965497db6a74f6e80f19c366697f1f7e9b8afd0bef30147304402203179df2f81c9036b5e30c8de9e49c6c6aec10622fda7c624f12b33012a9fc6e00220091c00ccd45efbb50307c9f16a83c0b6d7f762ba398761457383400f3f97361801475221035b8fb240f808f4d3d0d024fdf3b185b942e984bba81b6812b8610f66d59f3a84210332bcdca962953288be91cf480f41ae1ff2c97c7ff6d2875275d8254936eeb89852aeffffffff01a02526000000000017a914935f45db3b36484bd2fe4d231645beaaa6849e148700000000'
  );
  const result = await btc.signP2SHTransaction([[tx1, 0, redeemScript]], ["m/45'/1'/0'/0/0"], outputScript);

  return result;
}

function getOutputScript(btc, raw) {
  const tx1 = btc.splitTransaction(raw);
  const outputScript = btc.serializeTransactionOutputs(tx1).toString('hex');
  console.log('outputScript', outputScript);
  return outputScript;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={async () => {
            const pub = await getPublicKey("m/45'/1'/0'/0/0");
            console.log(pub);
          }}>
          get public key ("m/45'/1'/0'/0/0")
        </button>

        <button
          onClick={async () => {
            const pub = await getPublicKey("m/45'/1'/0'/0/1");
            console.log(pub);
          }}>
          get public key ("m/45'/1'/0'/0/1")
        </button>

        <button
          onClick={async () => {
            const [multiSignAddr, redeemScript] = await createP2sh();

            console.log('多签地址:', multiSignAddr.toString());
            console.log('赎回脚本:', redeemScript.toString());
          }}>
          构造多签
        </button>

        <button
          onClick={async () => {
            const pub = await getPublicKey("m/45'/1'/0'/0/0");

            const [, redeemScript] = await createP2sh();
            const txObj = await construct();
            const outputScript = getOutputScript(btc, txObj.toString());

            const result = await signP2sh(btc, redeemScript, outputScript);
            console.log(result);

            let s1 = {
              inputIndex: 0,
              prevTxId: '7661b30c1876fa5ae425a609298c2f429d5ac9fe7c5ba0d0209e4359851bdfd7',
              signature: bitcore.crypto.Signature.fromString(result[0]),
              sigtype: bitcore.crypto.Signature.SIGHASH_ALL,
              publicKey: bitcore.PublicKey(pub, {
                network: bitcore.Networks.testnet,
                compressed: true,
              }),
            };

            txObj.applySignature(s1);
            console.log('加入签名的交易', txObj.toString());
          }}>
          签名
        </button>
      </header>
    </div>
  );
}

export default App;
