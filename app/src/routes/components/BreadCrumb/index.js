import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { RouterGo } from '../../../components';
import { getDeepPath } from '../../../utils';
import routers from '../../App/routers';
import * as styles from './index.less';

@withRouter
class BreadCrumb extends Component {
  render() {
    const {
      match: { path },
    } = this.props;
    const routes = getDeepPath(routers, path);
    return (
      <ul className={styles.breadCrumb}>
        {routes.map((item, index) => (
          <RouterGo key={item.path} Ele="li" go={{ pathname: item.path }}>
            {item.title}
            {index === routes.length - 1 ? null : <span>></span>}
          </RouterGo>
        ))}
      </ul>
    );
  }
}

export default BreadCrumb;
