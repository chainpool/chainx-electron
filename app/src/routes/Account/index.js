import React from 'react';
import { Mixin } from '../../components';

import { Inject } from '../../utils';
import { ButtonGroup, Button, Icon, Clipboard } from '../../components';
import ImportAccountModal from './Modal/ImportAccountModal';
import SetPasswordModal from './Modal/SetPasswordModal';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { openModal },
    } = this.props;
    // openModal({
    //   name: 'SetPasswordModal',
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
                    <Icon name="icon-daoruzhanghu" className={styles.icon} />
                    导入账户
                  </div>
                  <div>
                    <Icon name="icon-tianjia" className={styles.icon} /> 新增账户
                  </div>
                </div>
                <ul>
                  {accounts.map((item, index) => (
                    <li key={index}>
                      <div>
                        <div>{item.name}</div>
                        <Icon name="icon-gengduocaozuo" />
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
      </div>
    );
  }
}

export default Account;
