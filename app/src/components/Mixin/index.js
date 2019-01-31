import React from 'react';
import { _, toJS } from '../../utils';

class Mixin extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = true;
  }

  async componentDidMount() {
    const { globalStore: { dispatch } = {} } = this.props;
    let assets = [];
    if (dispatch) {
      assets = await dispatch({ type: 'getAllAssets' });
    }
    _.isFunction(this.startInit) && this.startInit();
    return assets;
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: searchPrev },
    } = prevProps;
    const {
      location: { search },
    } = this.props;

    if (!_.isEqual(searchPrev, search)) {
      _.isFunction(this.startInit) && this.startInit();
      _.isFunction(this.componentWillUnsubscribe) && this.componentWillUnsubscribe();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    _.isFunction(this.componentWillUnsubscribe) && this.componentWillUnsubscribe();
  }

  changeState = (payload = {}, callback) => {
    if (this._isMounted) {
      this.setState(payload, () => {
        _.isFunction(callback) && callback(payload);
      });
    }
  };
}

export default Mixin;
