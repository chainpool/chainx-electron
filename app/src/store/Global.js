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
      const storeLanguage = localSave.get('lang');
      if (storeLanguage) {
        return storeLanguage;
      }
      // local store is null, get language from navigator
      // like "zh-TW", "zh-CN", "en-US"
      const lang = (navigator.language || navigator.userLanguage).toLowerCase();
      if (lang.indexOf('zh') > -1) {
        return 'zh';
      }
      return 'en';
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
    return this.assets;
  }

  @computed get chainNames() {
    return [this.assets[0].info.chain];
  }

  @computed get crossChainAssets() {
    return this.assets;
  }

  @computed get nativeAsset() {
    return this.assets;
  }

  @computed get nativeAssetName() {
    return 'PCX';
  }

  @computed get nativeAssetPrecision() {
    return 8;
  }

  @computed get assetNamePrecisionMap() {
    return [
      {
        ...this.assets.balance,
        ...this.assets.info,
      },
    ];
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
      let res = await getAssets();

      const result = JSON.parse(JSON.stringify(res));
      const assetsArray = [];

      assetsArray.push({
        ...result['1'].balance,
        ...result['1'].info,
      });

      this.changeModel('assets', assetsArray);

      console.log(assetsArray);

      return assetsArray;
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
