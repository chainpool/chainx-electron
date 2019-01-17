import { localSave, observable } from '@utils';
import ModelExtend from './ModelExtend';
import { getAssets } from '../services';

export default class Global extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }
  @observable
  modal = {
    status: false,
    name: '',
    data: '',
  };

  @observable assets = localSave.get('asset');

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

  getAllAssets = async () => {
    if (this.assets.length) return Promise.resolve(this.assets);
    let res = await getAssets(0, 100);
    const result = res.data.map((item = {}) => {
      return {
        ...item,
        ...(item.details ? item.details : {}),
      };
    });
    this.changeModel({
      assets: result,
    });
    localSave.set('asset', result);
    return result;
  };
}
