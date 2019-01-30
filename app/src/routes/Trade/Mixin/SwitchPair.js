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
    const {
      location: { search: searchPrev },
    } = prevProps;
    const {
      location: { search },
    } = this.props;

    if (!_.isEqual(searchPrev, search) && search) {
      _.isFunction(this.startInit) && this.startInit();
      _.isFunction(this.componentWillUnsubscribe) && this.componentWillUnsubscribe();
    }
    _.isFunction(this.componentUpdate) && this.componentUpdate(prevProps);
    // if (!_.isEqual(currentPairPrev, currentPair)) {
    //   console.log('kkkkkkkkkk');
    //   setTimeout(() => {
    //     _.isFunction(this.startInit) && this.startInit();
    //     _.isFunction(this.componentWillUnsubscribe) && this.componentWillUnsubscribe();
    //   });
    // }
  }
}

export default SwitchPair;
