import { observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Trade extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'trade';
}
