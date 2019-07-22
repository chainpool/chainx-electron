import { observable, autorun, toJS } from '../utils';
import ModelExtend from './ModelExtend';

import { computed } from 'mobx';

export default class TrustGovern extends ModelExtend {
  constructor(props) {
    super(props);
  }
  @observable name = 'TrustGovern';
}
