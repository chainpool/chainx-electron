import { observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Configure extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'asset';
}
