import React from 'react';
import { Mixin } from '../../components';
import { BreadCrumb, Tab } from '../components';
import * as styles from './index.less';

class DepositWithDrawRecord extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {};

  render() {
    const { activeIndex } = this.state;
    return (
      <div className={styles.depositWithDrawRecord}>
        <BreadCrumb />
        <div className={styles.tabLine}>
          <Tab
            tabs={['充值记录', '提现记录']}
            activeIndex={activeIndex}
            onClick={(value, index) => {
              this.setState({
                activeIndex: index,
              });
            }}
          />
        </div>
      </div>
    );
  }
}

export default DepositWithDrawRecord;
