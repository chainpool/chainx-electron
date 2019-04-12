import React from 'react';
import { Mixin, Tabs } from '../../components';
import { BreadCrumb } from '../components';
import DepositTable from './DepositTable';
import WithDrawTable from './WithDrawTable';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ assetStore: model }) => ({ model }))
class DepositWithDrawRecord extends Mixin {
  render() {
    return (
      <div className={styles.depositWithDrawRecord}>
        <BreadCrumb />
        <div className={styles.tabLine}>
          <Tabs tabs={['充值记录', '提现记录']}>
            {activeIndex => (
              <>{activeIndex === 0 ? <DepositTable {...this.props} /> : <WithDrawTable {...this.props} />}</>
            )}
          </Tabs>
        </div>
      </div>
    );
  }
}

export default DepositWithDrawRecord;
