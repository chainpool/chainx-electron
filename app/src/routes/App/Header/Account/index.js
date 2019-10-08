import React from 'react';
import {
  Button,
  ButtonGroup,
  Clipboard,
  FormattedMessage,
  Icon,
  Mixin,
  RouterGo,
  Scroller,
} from '../../../../components';
import { classNames, Inject, isElectron, isInnerWebSite, isSimulatedAccount } from '../../../../utils';
import ImportAccountModal from './Modal/ImportAccountModal';
import SetPasswordModal from './Modal/SetPasswordModal';
import ExportSecretModal from './Modal/ExportSecretModal';
import EditPasswordModal from './Modal/EditPasswordModal';
import EditLabelModal from './Modal/EditLabelModal';
import ForgetAccountModal from './Modal/ForgetAccountModal';
import CreateAccountModal from './Modal/CreateAccountModal';
import SetKeystorePasswordModal from './Modal/SetKeystorePasswordModal';
import ExportKeystoreModal from './Modal/ExportKeystoreModal';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  static AccountListLength = 5;
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
                <div className={styles.tag}>
                  {!isElectron() && isSimulatedAccount(item) ? <FormattedMessage id="SimulateAccount" /> : item.tag}
                </div>
                {!isElectron() && !isSimulatedAccount(item) && (
                  <div className={styles.popover}>
                    <Icon name="icon-gengduocaozuo" />
                    <div
                      className={classNames(
                        accounts.length > Account.AccountListLength && index >= accounts.length - 2 ? styles.down : ''
                      )}>
                      <ul className={styles.clickPopover}>
                        <>
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
                          {isInnerWebSite() && (
                            <>
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
                            </>
                          )}
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
                          <li
                            onClick={e => {
                              e.stopPropagation();
                              openModal({
                                name: 'ExportKeystoreModal',
                                data: {
                                  tag: item.tag,
                                  address: item.address,
                                  encoded: item.encoded,
                                  net: item.net,
                                },
                              });
                            }}>
                            <FormattedMessage id={'ExportKeystore'} />
                          </li>
                        </>
                      </ul>
                    </div>
                  </div>
                )}
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

    const canAddAccount = isElectron() || process.env.NODE_ENV === 'development';

    return (
      <div className={styles.account}>
        {isLogin() ? (
          <div className={styles.login}>
            <Icon name="icon-zhanghu" style={{ fontSize: 16 }} />
            <span style={{ marginLeft: 9 }}>
              {!isElectron() && isSimulatedAccount(currentAccount) ? (
                <FormattedMessage id={currentAccount.tag} />
              ) : (
                currentAccount.tag
              )}
            </span>
            <div className={classNames(styles.accountlist)}>
              <div>
                {!canAddAccount ? null : (
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
                )}

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
          </ButtonGroup>
        )}

        {name === 'ImportAccountModal' ? <ImportAccountModal {...this.props} /> : null}
        {name === 'SetPasswordModal' ? <SetPasswordModal {...this.props} /> : null}
        {name === 'ExportSecretModal' ? <ExportSecretModal {...this.props} /> : null}
        {name === 'EditPasswordModal' ? <EditPasswordModal {...this.props} /> : null}
        {name === 'EditLabelModal' ? <EditLabelModal {...this.props} /> : null}
        {name === 'ForgetAccountModal' ? <ForgetAccountModal {...this.props} /> : null}
        {name === 'CreateAccountModal' ? <CreateAccountModal {...this.props} /> : null}
        {name === 'SetKeystorePasswordModal' ? <SetKeystorePasswordModal {...this.props} /> : null}
        {name === 'ExportKeystoreModal' ? <ExportKeystoreModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Account;
