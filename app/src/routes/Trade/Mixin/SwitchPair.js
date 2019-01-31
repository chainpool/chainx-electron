import React from 'react';
import { Mixin } from '../../../components';
import { _, toJS } from '@utils';
import { parseQueryString } from '../../../utils';

class SwitchPair extends Mixin {
  constructor(props) {
    super(props);
  }

  async componentDidMount(prevProps) {
    const init = this.startInit;
    this.startInit = null;
    await super.componentDidMount(prevProps);
    const {
      model: { dispatch } = {},
      location: { search },
    } = this.props;
    const id = parseQueryString(search).id;
    if (dispatch) {
      await dispatch({ type: 'getOrderPairs' });
      await dispatch({
        type: 'switchPair',
        payload: {
          id,
        },
      });
    }
    this.startInit = init;
    _.isFunction(this.startInit) && this.startInit();
  }

  componentDidUpdate(prevProps) {
    super.componentDidUpdate(prevProps);
    const {
      location: { search: searchPrev },
    } = prevProps;
    const {
      location: { search },
      model: { dispatch },
    } = this.props;

    if (!_.isEqual(searchPrev, search)) {
      if (!search) {
        dispatch({
          type: 'clearAll',
        });
      }
    }
  }
}

export default SwitchPair;
