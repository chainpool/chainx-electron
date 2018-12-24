import { default as AssetStore } from './Asset';
import { default as GlobalStore } from './Global';

class RootStore {
  constructor() {
    this.assetStore = new AssetStore(this);
    this.globalStore = new GlobalStore(this);
  }
}

export default new RootStore();
