import React from 'react';
import { Mixin } from '../../../components';
import { _ } from '@utils';

class SwitchPair extends Mixin {
  constructor(props) {
    super(props);
  }

  async componentDidMount(prevProps) {
    const init = this.startInit;
    this.startInit = null;
    await super.componentDidMount(prevProps);
    const { model: { dispatch } = {} } = this.props;
    if (dispatch) {
      await dispatch({ type: 'getOrderPairs' });
      await dispatch({ type: 'switchPair' });
    }
    this.startInit = init;
    _.isFunction(this.startInit) && this.startInit();
  }

  componentDidUpdate(prevProps) {
    super.componentDidUpdate(prevProps);
    const { model: { currentPair = {}, currentPair_prev: currentPairPrev = {} } = {} } = this.props;
    if (!_.isEqual(currentPairPrev, currentPair) && currentPair) {
      setTimeout(() => {
        _.isFunction(this.startInit) && this.startInit();
        _.isFunction(this.componentWillUnsubscribe) && this.componentWillUnsubscribe();
      });
    }
  }
}

export default SwitchPair;
