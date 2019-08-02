import React from 'react';
import { FormattedMessage, Mixin, Tabs } from '../../components';
import { BreadCrumb } from '../components';
import DepositTable from './DepositTable';
import WithDrawTable from './WithDrawTable';
import LockListTable from './LockListTable';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ assetStore: model }) => ({ model }))
class DepositWithDrawRecord extends Mixin {
  render() {
    return (
      <div className={styles.depositWithDrawRecord}>
        <BreadCrumb />
        <div className={styles.tabLine}>
          <Tabs
            tabs={[
              <FormattedMessage id={'DepositRecords'} />,
              <FormattedMessage id={'WithdrawalRecords'} />,
              <FormattedMessage id={'LockPositionRecords'} />,
            ]}>
            {activeIndex => (
              <>
                {activeIndex === 0 && <DepositTable {...this.props} />}
                {activeIndex === 1 && <WithDrawTable {...this.props} />}
                {activeIndex === 2 && <LockListTable {...this.props} />}
              </>
            )}
          </Tabs>
        </div>
      </div>
    );
  }
}

export default DepositWithDrawRecord;
