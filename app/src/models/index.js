import { default as AssetStore } from './AssetStore';

class RootStore {
  constructor() {
    this.assetStore = new AssetStore(this);
  }
}

export default new RootStore();
