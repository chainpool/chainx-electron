import React, { Component } from 'react';
import { RouterGo, Icon, AuthorityComponent } from '../../../components';
import { PATH } from '../../../constants';
import routers from '../../App/routers';
import * as styles from './Header.less';
import logo from '../../../resource/logo.png';
import Account from './Account';
import { Inject } from '../../../utils';

@Inject(({ globalStore }) => ({ globalStore }))
class Header extends Component {
  render() {
    const {
      location: { pathname } = {},
      className,
      globalStore: { isLogin },
    } = this.props;
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
                      {/*{item.path === PATH.trade ? <div className={styles.feewarn}>0手续费</div> : null}*/}
                    </RouterGo>
                  );
                  return item.path === PATH.asset ? (
                    <AuthorityComponent key={item.path}>{com}</AuthorityComponent>
                  ) : (
                    com
                  );
                })}
            </ul>
          </div>
          <div className={styles.right}>
            <div>
              <ul>
                <AuthorityComponent>
                  <li>
                    <RouterGo
                      go={{ pathname: PATH.operationRecord }}
                      className={pathname === PATH.operationRecord ? styles.active : null}>
                      <Icon name="icon-caozuojilu" />
                      <span style={{ marginLeft: 9 }}>操作记录</span>
                    </RouterGo>
                  </li>
                </AuthorityComponent>
                {[isLogin() ? 1 : 0, isLogin() ? 0 : 1].map((item, index) => {
                  return item === 0 ? (
                    <li key={index}>
                      <RouterGo
                        go={{ pathname: PATH.configure }}
                        className={pathname === PATH.configure ? styles.active : null}>
                        <Icon name="icon-shezhi" />
                      </RouterGo>
                    </li>
                  ) : item === 1 ? (
                    <li key={index}>
                      <Account {...this.props} />
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
