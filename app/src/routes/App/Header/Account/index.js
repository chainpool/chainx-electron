import React from 'react';
import { Mixin, RouterGo } from '../../../../components';
import { classNames, Inject, Device, parseQueryString, localSave } from '../../../../utils';
import { ButtonGroup, Button, Icon, Clipboard } from '../../../../components';
import ImportAccountModal from './Modal/ImportAccountModal';
import SetPasswordModal from './Modal/SetPasswordModal';
import ExportSecretModal from './Modal/ExportSecretModal';
import EditPasswordModal from './Modal/EditPasswordModal';
import EditLabelModal from './Modal/EditLabelModal';
import ForgetAccountModal from './Modal/ForgetAccountModal';
import CreateAccountModal from './Modal/CreateAccountModal';
import * as styles from './index.less';
import Linux from '../../../../resource/Linux.png';
import Mac from '../../../../resource/Mac.png';
import Win from '../../../../resource/Win.png';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  state = {};
  startInit = () => {
    const {
      model: { dispatch },
      location: { search },
    } = this.props;
    const address = parseQueryString(search).address;
    if (address) {
      dispatch({
        type: 'switchAccount',
        payload: {
          address,
        },
      });
    }
  };

  render() {
    const {
      model: { openModal, dispatch, isLogin, currentAccount = {}, accounts = [] },

      globalStore: {
        modal: { name },
      },
    } = this.props;

    return (
      <div className={styles.account}>
        {isLogin() ? (
          <div className={styles.login}>
            <Icon name="icon-zhanghu" />
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
                      <span style={{ color: '#555555' }}>导入账户</span>
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
                      <span style={{ color: '#555555' }}>新增账户</span>
                    </Button>
                  </div>
                </div>
                <ul>
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
                            <div>
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
                                  忘记账户
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
                                  修改标签
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
                                  修改密码
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
                                  导出私钥
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
              </div>
            </div>
          </div>
        ) : (
          <ButtonGroup>
            <Button type="warnoutline" className={styles.addaccount}>
              添加账户
              <div>
                <div>
                  <ul>
                    <li
                      onClick={() => {
                        openModal({
                          name: 'ImportAccountModal',
                        });
                      }}>
                      <Icon name="icon-daoruzhanghu" />
                      导入账户
                    </li>
                    <li
                      onClick={() => {
                        openModal({
                          name: 'CreateAccountModal',
                        });
                      }}>
                      <Icon name="icon-tianjia" />
                      新增账户
                    </li>
                  </ul>
                </div>
              </div>
            </Button>
            <Button type="success" onClick={() => {}} className={styles.download}>
              下载钱包
              <div>
                <div>
                  <Icon name="icon-xiazai" className={styles.downloadicon} />
                  <div className={styles.appname}>桌面端安全钱包</div>
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
          </ButtonGroup>
        )}

        {name === 'ImportAccountModal' ? <ImportAccountModal {...this.props} /> : null}
        {name === 'SetPasswordModal' ? <SetPasswordModal {...this.props} /> : null}
        {name === 'ExportSecretModal' ? <ExportSecretModal {...this.props} /> : null}
        {name === 'EditPasswordModal' ? <EditPasswordModal {...this.props} /> : null}
        {name === 'EditLabelModal' ? <EditLabelModal {...this.props} /> : null}
        {name === 'ForgetAccountModal' ? <ForgetAccountModal {...this.props} /> : null}
        {name === 'CreateAccountModal' ? <CreateAccountModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Account;
