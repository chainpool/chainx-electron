import { default as AssetStore } from './Asset';
import { default as ElectionStroe } from './Election';
import { default as GlobalStore } from './Global';
import { default as TradeStore } from './Trade';
import { default as AccountStore } from './Account';
import { default as Configure } from './Configure';

class RootStore {
  constructor() {
    this.assetStore = new AssetStore(this);
    this.electionStore = new ElectionStroe(this);
    this.tradeStore = new TradeStore(this);
    this.globalStore = new GlobalStore(this);
    this.accountStore = new AccountStore(this);
    this.Configure = new Configure(this);
  }
}

export default new RootStore();
