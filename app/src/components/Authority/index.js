import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { Inject } from '../../utils';
import { PATH } from '../../constants';

@Inject(({ accountStore: model }) => ({ model }))
class AuthorityRoute extends Component {
  render() {
    const {
      model: { isLogin },
      authority = [],
    } = this.props;
    return authority[0] && !isLogin() ? <Redirect to={PATH.default} /> : <Route {...this.props} />;
  }
}

@Inject(({ accountStore: model }) => ({ model }))
class AuthorityComponent extends Component {
  render() {
    const {
      children,
      model: { isLogin },
    } = this.props;
    return !isLogin() ? null : <>{children}</>;
  }
}

export { AuthorityRoute, AuthorityComponent };
