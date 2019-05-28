import React from 'react';
import { FormattedMessage, Mixin, RouterGo, Scroller } from '../../../../components';
import { classNames, Inject, Device } from '../../../../utils';
import { ButtonGroup, Button, Icon, Clipboard } from '../../../../components';
import ImportAccountModal from './Modal/ImportAccountModal';
import SetPasswordModal from './Modal/SetPasswordModal';
import ExportSecretModal from './Modal/ExportSecretModal';
import EditPasswordModal from './Modal/EditPasswordModal';
import EditLabelModal from './Modal/EditLabelModal';
import ForgetAccountModal from './Modal/ForgetAccountModal';
import CreateAccountModal from './Modal/CreateAccountModal';
import SetKeystorePassword from './Modal/SetKeystorePassword';
import * as styles from './index.less';
import Linux from '../../../../resource/Linux.png';
import Mac from '../../../../resource/Mac.png';
import Win from '../../../../resource/Win.png';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  static AccountListLength = 6;
  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getAccountAssets',
    });
  };

  render() {
    const {
      model: { openModal, dispatch, isLogin, currentAccount = {}, accounts = [] },

      globalStore: {
        modal: { name },
      },
    } = this.props;

    const accountULList = (
      <ul className={styles.accountul}>
        {accounts.map((item = {}, index) => {
          const id = `popoverid_${index}`;
          return (
            <RouterGo
              Ele="li"
              go={{
                search: `?address=${item.address}`,
              }}
              className={currentAccount.address === item.address ? styles.active : null}
              key={index}
              id={id}
              onClick={() => {
                dispatch({
                  type: 'switchAccount',
                  payload: {
                    address: item.address,
                  },
                });
              }}>
              <div className={styles.leftbar} />
              <div>
                <div className={styles.tag}>{item.tag}</div>
                <div className={styles.popover}>
                  <Icon name="icon-gengduocaozuo" />
                  <div
                    className={classNames(
                      accounts.length > Account.AccountListLength && index >= accounts.length - 2 ? styles.down : ''
                    )}>
                    <ul className={styles.clickPopover}>
                      <li
                        onClick={e => {
                          e.stopPropagation();
                          openModal({
                            name: 'ForgetAccountModal',
                            data: {
                              encoded: item.encoded,
                              address: item.address,
                            },
                          });
                        }}>
                        <FormattedMessage id={'ForgetAccount'} />
                      </li>
                      <li
                        onClick={e => {
                          e.stopPropagation();
                          openModal({
                            name: 'EditLabelModal',
                            data: {
                              address: item.address,
                            },
                          });
                        }}>
                        <FormattedMessage id={'ModifyLabel'} />
                      </li>
                      <li
                        onClick={e => {
                          e.stopPropagation();
                          openModal({
                            name: 'EditPasswordModal',
                            data: {
                              encoded: item.encoded,
                              address: item.address,
                            },
                          });
                        }}>
                        <FormattedMessage id={'ChangePassword'} />
                      </li>
                      <li
                        onClick={e => {
                          e.stopPropagation();
                          openModal({
                            name: 'ExportSecretModal',
                            data: {
                              encoded: item.encoded,
                            },
                          });
                        }}>
                        <FormattedMessage id={'ExportPrivateKey'} />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <Clipboard>
                  <span className={styles.address}>{item.address}</span>
                </Clipboard>
              </div>
            </RouterGo>
          );
        })}
      </ul>
    );

    return (
      <div className={styles.account}>
        {isLogin() ? (
          <div className={styles.login}>
            <Icon name="icon-zhanghu" style={{ fontSize: 16 }} />
            <span style={{ marginLeft: 9 }}>{currentAccount.tag}</span>
            <div className={classNames(styles.accountlist)}>
              <div>
                <div className={styles.quickentry}>
                  <div>
                    <Button
                      type="blank"
                      onClick={() => {
                        openModal({
                          name: 'ImportAccountModal',
                        });
                      }}>
                      <Icon name="icon-daoruzhanghu" className={styles.icon} />
                      <span style={{ color: '#555555' }}>
                        <FormattedMessage id={'ImportAccount'} />
                      </span>
                    </Button>
                  </div>
                  <div>
                    <Button
                      type="blank"
                      onClick={() => {
                        openModal({
                          name: 'CreateAccountModal',
                        });
                      }}>
                      <Icon name="icon-tianjia" className={styles.icon} />
                      <span style={{ color: '#555555' }}>
                        <FormattedMessage id={'NewAccount'} />
                      </span>
                    </Button>
                  </div>
                </div>
                {accounts.length > Account.AccountListLength ? (
                  <Scroller scroll={{ y: 97 * Account.AccountListLength, forceRefresh: true }}>
                    {accountULList}
                  </Scroller>
                ) : (
                  accountULList
                )}
              </div>
            </div>
          </div>
        ) : (
          <ButtonGroup>
            <Button type="warnoutline" className={styles.addaccount} Ele={'div'}>
              <FormattedMessage id={'AddAccount'} />
              <div className={styles.hoverpannel}>
                <div>
                  <ul>
                    <li
                      onClick={() => {
                        openModal({
                          name: 'CreateAccountModal',
                        });
                      }}>
                      <Icon name="icon-tianjia" />
                      <FormattedMessage id={'NewAccount'} />
                    </li>
                    <li
                      onClick={() => {
                        openModal({
                          name: 'ImportAccountModal',
                        });
                      }}>
                      <Icon name="icon-daoruzhanghu" />
                      <FormattedMessage id={'ImportAccount'} />
                    </li>
                  </ul>
                </div>
              </div>
            </Button>
            {false && (
              <Button type="success" className={styles.download} Ele={'div'}>
                下载钱包
                <div>
                  <div>
                    <div className={styles.desc}>
                      <Icon name="icon-xiazai" className={styles.downloadicon} />
                      <div className={styles.appname}>桌面端安全钱包</div>
                    </div>
                    <div className={styles.desc}>去中心化全节点钱包，不依赖中心化交易所</div>
                    <ul>
                      {[
                        {
                          src: Win,
                          alias: 'Win',
                          name: 'Windows',
                        },
                        {
                          src: Mac,
                          alias: 'Mac',
                          name: 'MacOs',
                        },
                        {
                          src: Linux,
                          alias: 'Linux',
                          name: 'Linux',
                        },
                      ].map(item => (
                        <li key={item.name}>
                          <img src={item.src} alt={`${item.src}`} />
                          <div>{item.name}</div>
                          <div
                            className={classNames(
                              styles.button,
                              Device.getOS() === `${item.alias}` ? styles.active : null
                            )}>
                            下载
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Button>
            )}
          </ButtonGroup>
        )}

        {name === 'ImportAccountModal' ? <ImportAccountModal {...this.props} /> : null}
        {name === 'SetPasswordModal' ? <SetPasswordModal {...this.props} /> : null}
        {name === 'ExportSecretModal' ? <ExportSecretModal {...this.props} /> : null}
        {name === 'EditPasswordModal' ? <EditPasswordModal {...this.props} /> : null}
        {name === 'EditLabelModal' ? <EditLabelModal {...this.props} /> : null}
        {name === 'ForgetAccountModal' ? <ForgetAccountModal {...this.props} /> : null}
        {name === 'CreateAccountModal' ? <CreateAccountModal {...this.props} /> : null}
        {name === 'SetKeystorePassword' ? <SetKeystorePassword {...this.props} /> : null}
      </div>
    );
  }
}

export default Account;
