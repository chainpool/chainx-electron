import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { _ } from '../../../src/utils';
import * as styles from './index.less';

@withRouter
class RouterGo extends PureComponent {
  render() {
    const {
      children,
      history,
      Ele = 'span',
      go = {},
      go: { pathname } = {},
      className,
      isOutSide = false,
      onClick,
    } = this.props;
    const routerGo = payload => {
      if (_.isNumber(payload)) return history.go(payload);
      payload && history.push(payload);
    };

    const url = !/http/.test(pathname) ? `http://${pathname}` : pathname;

    return isOutSide ? (
      <a className={styles.url} rel="noopener noreferrer" href={url} target="_blank">
        {children || pathname}
      </a>
    ) : (
      <Ele
        style={{ cursor: 'pointer' }}
        className={className}
        onClick={() => {
          routerGo(go);
          _.isFunction(onClick) && onClick();
        }}>
        {children}
      </Ele>
    );
  }
}

export default RouterGo;
