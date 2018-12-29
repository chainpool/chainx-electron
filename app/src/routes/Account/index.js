import React from 'react';
import { Mixin } from '../../components';

import { Inject } from '../../utils';
import { ButtonGroup, Button, Icon } from '../../components';
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
      model: { openModal, isLogin, currentAccount },
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
