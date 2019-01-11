import { observable } from '../utils';
import ModelExtend from './ModelExtend';

export default class Trust extends ModelExtend {
  constructor(rootStore) {
    super(rootStore);
  }

  @observable name = 'Trust';
}
