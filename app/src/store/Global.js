import { localSave, observable } from '@utils';
import ModelExtend from './ModelExtend';
import { getAssets } from '../services';
import { autorun, computed } from 'mobx';
import { Chain } from '@constants';

export default class Global extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
    this.getDefaultLanguage = () => {
      // local store has language value
      if (localSave.get('lang')) {
        return localSave.get('lang');
      } else {
        // local store is null, get language from navigator
        // like "zh-TW", "zh-CN", "en-US"
        const lang = (navigator.language || navigator.userLanguage).toLowerCase();
        if (lang.indexOf('zh') > -1) {
          return 'zh';
        } else {
          return 'en';
        }
      }
    };

    autorun(() => {
      localSave.set('asset', this.assets);
      localSave.set('lang', this.language);
    });
  }

  @observable history = null;

  @observable
  modal = {
    status: true,
    name: '',
    data: '',
  };

  @observable assets = localSave.get('asset') || [];

  @observable language = this.getDefaultLanguage();

  @computed get onlineAssets() {
    return this.assets.filter(asset => asset.online);
  }

  @computed get chainNames() {
    return this.onlineAssets.map(asset => asset.name);
  }

  @computed get crossChainAssets() {
    return this.onlineAssets.filter(asset => asset.chain !== Chain.nativeChain);
  }

  @computed get nativeAsset() {
    return this.onlineAssets.find(asset => asset.chain === Chain.nativeChain);
  }

  @computed get nativeAssetName() {
    return (this.nativeAsset && this.nativeAsset.name) || '';
  }

  @computed get nativeAssetPrecision() {
    return (this.nativeAsset && this.nativeAsset.precision) || 0;
  }

  @computed get assetNamePrecisionMap() {
    let result = {};
    this.assets.forEach(({ name, precision }) => {
      result[name] = precision;
    });
    return result;
  }

  openModal = (payload = {}) => {
    this.changeModel('modal', {
      status: true,
      ...payload,
    });
  };

  closeModal = () => {
    this.changeModel('modal', {
      status: false,
      name: '',
      data: '',
    });
  };

  setHistory = ({ history }) => {
    this.changeModel('history', history);
  };

  getAllAssets = async () => {
    const update = async () => {
      let res = await getAssets(0, 100);
      const result = res.data.map((item = {}) => {
        return {
          ...item,
          ...(item.details ? item.details : {}),
        };
      });
      this.changeModel('assets', result);
      return result;
    };
    if (this.assets.length) {
      update();
      return Promise.resolve(this.assets);
    } else {
      return await update();
    }
  };

  switchLanguage = ({ lang }) => {
    this.changeModel('language', lang);
  };
}
