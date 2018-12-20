import { observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Home extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable todos = [{ name: '1' }, { name: '2' }];

  @observable loading = {
    getExample1: false,
  };
}
