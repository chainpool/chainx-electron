import React from 'react';
import { Mixin } from '../../components';
import { classNames, Inject } from '../../utils';
import { ButtonGroup, Button, Icon, Clipboard } from '../../components';
import ImportAccountModal from './Modal/ImportAccountModal';
import SetPasswordModal from './Modal/SetPasswordModal';
import ExportSecretModal from './Modal/ExportSecretModal';
import EditPasswordModal from './Modal/EditPasswordModal';
import EditLabelModal from './Modal/EditLabelModal';
import ForgetAccountModal from './Modal/ForgetAccountModal';
import CreateAccountModal from './Modal/CreateAccountModal';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'switchAccount',
    });
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
            <span>{currentAccount.tag}</span>
            <Icon name="icon-xiala" />
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
                      <li
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
                          <div>{item.tag}</div>
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
                                    });
                                  }}>
                                  修改密码
                                </li>
                                <li
                                  onClick={e => {
                                    e.stopPropagation();
                                    openModal({
                                      name: 'ExportSecretModal',
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
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <ButtonGroup>
            <Button
              onClick={() => {
                openModal({
                  name: 'ImportAccountModal',
                });
              }}>
              导入账户
            </Button>
            <Button
              type="success"
              onClick={() => {
                openModal({
                  name: 'CreateAccountModal',
                });
              }}>
              创建账户
            </Button>
            <Button type="success">下载钱包</Button>
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
