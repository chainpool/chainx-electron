import React, { Component } from 'react';
import { RouterGo, Icon, AuthorityComponent } from '../../../components';
import { PATH } from '../../../constants';
import routers from '../../App/routers';
import * as styles from './Header.less';
import logo from '../../../resource/logo.png';
import Account from './Account';

class Header extends Component {
  render() {
    const { location: { pathname } = {}, className } = this.props;
    return (
      <header className={className}>
        <div>
          <div className={styles.nav}>
            <RouterGo isOutSide go={{ pathname: 'https://chainx.org' }}>
              <img src={logo} alt="logo" />
            </RouterGo>

            <div className={styles.net}>测试网</div>
            <ul>
              {routers
                .filter(item => item.show !== false)
                .map(item => {
                  const com = (
                    <RouterGo
                      key={item.path}
                      Ele="li"
                      go={{ pathname: item.path }}
                      className={pathname === item.path ? styles.active : null}>
                      {item.title}
                      {item.path === PATH.trade ? <div className={styles.feewarn}>0手续费</div> : null}
                    </RouterGo>
                  );
                  return item.path === PATH.asset ? <AuthorityComponent>{com}</AuthorityComponent> : com;
                })}
            </ul>
          </div>
          <div className={styles.right}>
            <div>
              <ul>
                <li>
                  <RouterGo
                    go={{ pathname: PATH.configure }}
                    className={pathname === PATH.configure ? styles.active : null}>
                    <Icon name="icon-shezhi" />
                    <span>设置</span>
                  </RouterGo>
                </li>
                <li>
                  <RouterGo
                    go={{ pathname: PATH.operationRecord }}
                    className={pathname === PATH.operationRecord ? styles.active : null}>
                    <Icon name="icon-caozuojilu" />
                    <span>操作记录</span>
                  </RouterGo>
                </li>
              </ul>
            </div>
            <Account {...this.props} />
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
