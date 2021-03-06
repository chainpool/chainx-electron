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
    _.isFunction(this.componentMount) && this.componentMount();
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
    if (callback && callback.interval) {
      clearTimeout(callback.interval);
      callback.interval = null;
    }

    if (!this._isMounted) return;
    if (_.isFunction(callback)) {
      const result = callback(...args);
      if (result && result.then) {
        if (!this._isMounted) return;
        result.then(() => {
          callback.interval = setTimeout(() => {
            this.fetchPoll(callback);
          }, AjaxCallTime);
        });
      }
    }
  };

  fetchPollIfFail = (callback, ...args) => {
    const time = args[0];
    if (callback && callback.interval) {
      clearTimeout(callback.interval);
      callback.interval = null;
    }

    if (!this._isMounted) return;
    if (_.isFunction(callback)) {
      const result = callback(...args);
      if (result && result.catch) {
        if (!this._isMounted) return;
        result.catch(() => {
          callback.interval = setTimeout(() => {
            this.fetchPollIfFail(callback, ...args);
          }, time || AjaxCallTime);
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
