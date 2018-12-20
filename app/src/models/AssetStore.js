import { observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Asset extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';
}
