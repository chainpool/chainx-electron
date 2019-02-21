import React, { Component } from 'react';
import { Redirect, Route } from 'react-router';
import { Inject } from '../../utils';
import { PATH } from '../../constants';

@Inject(({ accountStore: model }) => ({ model }))
class AuthorityRoute extends Component {
  render() {
    const {
      model: { isLogin, isTrustee },
      authority = [],
      requireTrustee,
    } = this.props;

    if (requireTrustee && !isTrustee) {
      return <Redirect to={PATH.default} />;
    }

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
