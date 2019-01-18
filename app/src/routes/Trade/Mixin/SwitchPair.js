import React from 'react';
import { Mixin } from '../../../components';
import { _ } from '@utils';

class SwitchPair extends Mixin {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const init = this.startInit;
    this.startInit = null;
    await super.componentDidMount();
    const { model: { dispatch } = {} } = this.props;
    if (dispatch) {
      await dispatch({ type: 'getOrderPairs' });
    }
    _.isFunction(init) && init();
  }
}

export default SwitchPair;
