import React, { Component, Fragment } from 'react';
import { AuthorityComponent, Icon, RouterGo, FormattedMessage } from '../../../components';
import { PATH, ShowLanguage } from '../../../constants';
import routers from '../../App/routers';
import * as styles from './Header.less';
import logo from '../../../resource/logo.png';
import classNames from 'classnames';
import Account from './Account';
import { Inject, getDeepPath } from '../../../utils';

@Inject(({ configureStore, accountStore }) => ({ configureStore, accountStore }))
class Header extends Component {
  render() {
    const {
      location: { pathname } = {},
      className,
      configureStore: { isLogin, isTestNet },
      globalStore: { language, dispatch: dispatchGlobal },
    } = this.props;

    const showRouters = routers.filter(item => item.show !== false);

    return (
      <header className={className}>
        <div>
          <div className={styles.nav}>
            <RouterGo isOutSide go={{ pathname: 'https://chainx.org' }}>
              <img src={logo} alt="logo" style={{ height: 28 }} />
            </RouterGo>

            <ul>
              {showRouters.map(item => {
                const com = (
                  <RouterGo
                    key={item.path}
                    Ele="li"
                    go={{ pathname: item.status === 'awaiting' ? '' : item.path }}
                    className={classNames(
                      item.warn ? styles.warn : null,
                      getDeepPath(routers, pathname).filter(item2 => item2.path === item.path)[0] ? styles.active : null
                    )}>
                    <FormattedMessage id={item.title} />
                    {item.warn ? (
                      <div className={styles.warn}>
                        <FormattedMessage id={item.warn} />
                      </div>
                    ) : null}
                  </RouterGo>
                );
                return item.authority && item.authority[0] === 1 ? (
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
                      go={{ pathname: PATH.tradeRecord }}
                      className={pathname === PATH.tradeRecord ? styles.active : null}>
                      <Icon name="icon-caozuojilu" />
                      <span style={{ marginLeft: 9 }}>
                        <FormattedMessage id={'TradingRecord'} />
                      </span>
                    </RouterGo>
                  </li>
                </AuthorityComponent>

                {[isLogin() ? 1 : 0, isLogin() ? 0 : 1].map((item, index) => {
                  return item === 0 ? (
                    <Fragment key={index}>
                      <li>
                        <RouterGo isOutSide go={{ pathname: 'https://chainx.org/help' }}>
                          <Icon name="icon-jieshishuoming" className={styles.helpicon} />
                          <span style={{ marginLeft: 9 }} className={styles.help}>
                            <FormattedMessage id={'Help'} />
                          </span>
                        </RouterGo>
                      </li>
                      <li className={classNames(styles.navli, isTestNet ? styles.warn : null)}>
                        <RouterGo
                          go={{ pathname: PATH.configure }}
                          className={pathname === PATH.configure ? styles.active : null}>
                          <Icon name="icon-shezhi" style={{ fontSize: 16 }} />
                        </RouterGo>
                        {isTestNet && (
                          <div
                            className={classNames(styles.testlogo, styles.warn, !isLogin() ? styles.notlogin : null)}>
                            <FormattedMessage id={'TestNet'} />
                          </div>
                        )}
                      </li>
                    </Fragment>
                  ) : item === 1 ? (
                    <li key={index} className={classNames(styles.navli)}>
                      <Account {...this.props} />
                    </li>
                  ) : null;
                })}

                {/*{ShowLanguage && (*/}
                {/*<li className={styles.language}>*/}
                {/*{language === 'zh' ? '中文' : 'English'}*/}
                {/*<div>*/}
                {/*<ul>*/}
                {/*{[{ name: 'zh', value: '中文' }, { name: 'en', value: 'English' }].map(item => (*/}
                {/*<li*/}
                {/*key={item.name}*/}
                {/*className={language === item.name ? styles.active : null}*/}
                {/*onClick={() => {*/}
                {/*dispatchGlobal({*/}
                {/*type: 'switchLanguage',*/}
                {/*payload: {*/}
                {/*lang: item.name,*/}
                {/*},*/}
                {/*});*/}
                {/*}}>*/}
                {/*{item.value}*/}
                {/*</li>*/}
                {/*))}*/}
                {/*</ul>*/}
                {/*</div>*/}
                {/*</li>*/}
                {/*)}*/}
              </ul>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
