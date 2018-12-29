import React from 'react';
import { Mixin } from '../../components';

import { Inject } from '../../utils';
import { ButtonGroup, Button } from '../../components';
import ImportAccountModal from './Modal/ImportAccountModal';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { openModal },
    } = this.props;
    // openModal({
    //   name: 'ImportAccountModal',
    // });
  };

  render() {
    const {
      model: { openModal },
      globalStore: {
        modal: { name },
      },
    } = this.props;

    return (
      <div className={styles.account}>
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
        {name === 'ImportAccountModal' ? <ImportAccountModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Account;
