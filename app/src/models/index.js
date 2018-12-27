import { default as AssetStore } from './Asset';
import { default as ElectionStroe } from './Election';
import { default as GlobalStore } from './Global';
import { default as TradeStore } from './Trade';

class RootStore {
  constructor() {
    this.assetStore = new AssetStore(this);
    this.electionStore = new ElectionStroe(this);
    this.tradeStore = new TradeStore(this);
    this.globalStore = new GlobalStore(this);
  }
}

export default new RootStore();
