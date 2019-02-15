import React, { Component } from 'react';
import { AuthorityComponent, Icon, RouterGo } from '../../../components';
import { PATH } from '../../../constants';
import routers from '../../App/routers';
import * as styles from './Header.less';
import logo from '../../../resource/logo.png';
import logTest from '../../../resource/logo_test.png';
import Account from './Account';
import { Inject } from '../../../utils';

@Inject(({ configureStore, accountStore }) => ({ configureStore, accountStore }))
class Header extends Component {
  render() {
    const {
      location: { pathname } = {},
      className,
      configureStore: { isLogin, isTestNet },
      accountStore: { isTrustee },
    } = this.props;

    const showRouters = routers.filter(item => {
      if (item.show === false) {
        return false;
      }

      return !(item.path === PATH.trust && !isTrustee);
    });

    const accountAndSetting = [isLogin() ? 1 : 0, isLogin() ? 0 : 1].map((item, index) => {
      return item === 0 ? (
        <li key={index}>
          <RouterGo go={{ pathname: PATH.configure }} className={pathname === PATH.configure ? styles.active : null}>
            <Icon name="icon-shezhi" />
          </RouterGo>
        </li>
      ) : item === 1 ? (
        <li key={index}>
          <Account {...this.props} />
        </li>
      ) : null;
    });

    const txRecord = (
      <AuthorityComponent>
        <li>
          <RouterGo
            go={{ pathname: PATH.tradeRecord }}
            className={pathname === PATH.tradeRecord ? styles.active : null}>
            <Icon name="icon-caozuojilu" />
            <span style={{ marginLeft: 9 }}>交易记录</span>
          </RouterGo>
        </li>
      </AuthorityComponent>
    );

    return (
      <header className={className}>
        <div>
          <div className={styles.nav}>
            <RouterGo isOutSide go={{ pathname: 'https://chainx.org' }}>
              <img src={isTestNet ? logTest : logo} alt="logo" style={{ height: 28 }} />
            </RouterGo>

            <ul>
              {showRouters.map(item => {
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
                return item.path === PATH.asset ? <AuthorityComponent key={item.path}>{com}</AuthorityComponent> : com;
              })}
            </ul>
          </div>
          <div className={styles.right}>
            <div>
              <ul>
                {/*TODO: 没有API服务器，暂时隐藏交易记录*/}
                {false && txRecord}

                <li>
                  <Account {...this.props} />
                </li>
                {/* TODO: 暂时隐藏APP设置*/}
                {false && accountAndSetting}
              </ul>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
