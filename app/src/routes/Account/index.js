import React from 'react';
import { Mixin } from '../../components';

import { Inject } from '../../utils';
import { ButtonGroup, Button } from '../../components';
import * as styles from './index.less';

@Inject(({ accountStore: model }) => ({ model }))
class Account extends Mixin {
  state = {};

  startInit = () => {};

  render() {
    const props = {
      ...this.props,
    };

    return (
      <div className={styles.account}>
        <ButtonGroup>
          <Button>导入账户</Button>
          <Button type="success">创建账户</Button>
          <Button type="success">下载钱包</Button>
        </ButtonGroup>
      </div>
    );
  }
}

export default Account;
