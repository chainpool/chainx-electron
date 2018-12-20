import React, { Component } from 'react';
import { RouterGo } from '../../../components';
import routers from '../../App/routers';
import * as styles from './Header.less';
import logo from '../../../resource/logo.png';

class Header extends Component {
  render() {
    const { location: { pathname } = {} } = this.props;
    return (
      <div className={styles.headers}>
        <img src={logo} alt="logo" />
        <div className={styles.net}>测试网</div>
        <ul>
          {routers.map(item => (
            <RouterGo
              key={item.path}
              Ele="li"
              go={{ pathname: item.path }}
              className={pathname === item.path ? styles.active : null}>
              {item.title}
            </RouterGo>
          ))}
        </ul>
      </div>
    );
  }
}

export default Header;
