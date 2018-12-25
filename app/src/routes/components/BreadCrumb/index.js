import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { RouterGo, routerGo } from '../../../components';
import { _ } from '../../../utils';
import routers from '../../App/routers';
import * as styles from './index.less';

@withRouter
class BreadCrumb extends Component {
  render() {
    const {
      match: { path },
    } = this.props;
    const routes =
      routers.filter(one =>
        _.find(
          path
            .split('/')
            .filter(item => item)
            .concat(path.slice(1)),
          item => `/${item}` === one.path
        )
      ) || [];
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
