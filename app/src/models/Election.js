import { observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Election extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'election';
}
