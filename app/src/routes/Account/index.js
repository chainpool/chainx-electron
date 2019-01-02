import React from 'react';
import { Mixin } from '../../components';

import { Inject } from '../../utils';
import { ButtonGroup, Button, Icon, Clipboard, Popover } from '../../components';
import ImportAccountModal from './Modal/ImportAccountModal';
import SetPasswordModal from './Modal/SetPasswordModal';
import ExportSecretModal from './Modal/ExportSecretModal';
import EditPasswordModal from './Modal/EditPasswordModal';
import EditLabelModal from './Modal/EditLabelModal';
import ForgetAccountModal from './Modal/ForgetAccountModal';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { openModal },
    } = this.props;
    // openModal({
    //   name: 'ForgetAccountModal',
    // });
  };

  render() {
    const {
      model: { openModal, isLogin, currentAccount, accounts = [] },
      globalStore: {
        modal: { name },
      },
    } = this.props;

    return (
      <div className={styles.account}>
        {isLogin() ? (
          <div className={styles.login}>
            <Icon name="icon-zhanghu" />
            <span>{currentAccount.name}</span>
            <Icon name="icon-xiala" />
            <div className={styles.accountlist}>
              <div>
                <div className={styles.quickentry}>
                  <div>
                    <Button type="blank">
                      <Icon name="icon-daoruzhanghu" className={styles.icon} />
                      <span style={{ color: '#555555' }}>导入账户</span>
                    </Button>
                  </div>
                  <div>
                    <Button type="blank">
                      <Icon name="icon-tianjia" className={styles.icon} />
                      <span style={{ color: '#555555' }}>新增账户</span>
                    </Button>
                  </div>
                </div>
                <ul>
                  {accounts.map((item, index) => (
                    <li key={index}>
                      <div>
                        <div>{item.name}</div>
                        <Popover
                          body={
                            <ul className={styles.popover}>
                              <li
                                onClick={() => {
                                  openModal({
                                    name: 'ForgetAccountModal',
                                  });
                                }}>
                                忘记账户
                              </li>
                              <li
                                onClick={() => {
                                  openModal({
                                    name: 'EditLabelModal',
                                  });
                                }}>
                                修改标签
                              </li>
                              <li
                                onClick={() => {
                                  openModal({
                                    name: 'EditPasswordModal',
                                  });
                                }}>
                                修改密码
                              </li>
                              <li
                                onClick={() => {
                                  openModal({
                                    name: 'ExportSecretModal',
                                  });
                                }}>
                                导出私钥
                              </li>
                            </ul>
                          }>
                          <Icon name="icon-gengduocaozuo" />
                        </Popover>
                      </div>
                      <div>
                        <Clipboard>
                          <span className={styles.address}>{item.address}</span>
                        </Clipboard>
                      </div>
                    </li>
                  ))}
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
            <Button type="success">创建账户</Button>
            <Button type="success">下载钱包</Button>
          </ButtonGroup>
        )}

        {name === 'ImportAccountModal' ? <ImportAccountModal {...this.props} /> : null}
        {name === 'SetPasswordModal' ? <SetPasswordModal {...this.props} /> : null}
        {name === 'ExportSecretModal' ? <ExportSecretModal {...this.props} /> : null}
        {name === 'EditPasswordModal' ? <EditPasswordModal {...this.props} /> : null}
        {name === 'EditLabelModal' ? <EditLabelModal {...this.props} /> : null}
        {name === 'ForgetAccountModal' ? <ForgetAccountModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Account;
