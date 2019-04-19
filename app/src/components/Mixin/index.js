import React from 'react';
import { _ } from '../../utils';
import { AjaxCallTime } from '../../constants';

class Mixin extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = true;
  }

  async componentDidMount() {
    _.isFunction(this.startInit) && this.startInit();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: searchPrev },
    } = prevProps;
    const {
      location: { search },
      globalStore: { dispatch: dispatchGlobal },
    } = this.props;
    if (!_.isEqual(searchPrev, search)) {
      dispatchGlobal({
        type: 'setHistory',
        payload: {
          history: this.props.history,
        },
      });
      _.isFunction(this.startInit) && this.startInit();
      _.isFunction(this.componentWillUnsubscribe) && this.componentWillUnsubscribe();
    }
    _.isFunction(this.componentUpdate) && this.componentUpdate(prevProps);
  }

  componentWillUnmount() {
    this._isMounted = false;
    _.isFunction(this.componentWillUnsubscribe) && this.componentWillUnsubscribe();
    this.fetchPoll();
  }

  changeState = (payload = {}, callback) => {
    if (this._isMounted) {
      this.setState(payload, () => {
        _.isFunction(callback) && callback(payload);
      });
    }
  };

  fetchPoll = (callback, ...args) => {
    const intervalId = _.uniqueId('intervalPoll');
    clearTimeout(this[intervalId]);
    if (!this._isMounted) return;
    if (_.isFunction(callback)) {
      const result = callback(...args);
      if (result && result.then) {
        if (!this._isMounted) return;
        result.then(() => {
          this[intervalId] = setTimeout(() => {
            this.fetchPoll(callback);
          }, AjaxCallTime);
        });
      }
    }
  };

  fetchTimeOut = (callback, test) => {
    if (!test) return;
    clearTimeout(this.interval);
    if (!this._isMounted) return;
    if (_.isFunction(callback)) {
      this.interval = setTimeout(callback, AjaxCallTime);
    }
  };
}

export default Mixin;
