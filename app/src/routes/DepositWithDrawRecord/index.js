import React from 'react';
import { Mixin, Tabs, FormattedMessage, RouterGo } from '../../components';
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
        <div className={styles.notgetdeposit}>
          <strong>
            <FormattedMessage id={'DepositNotReceived'}>
              {msg => {
                const msgs = msg.split('deposit_replace');
                return (
                  <>
                    {msgs[0]}
                    <RouterGo isOutSide go={{ pathname: 'https://scan.chainx.org/crossblocks/bitcoin/claim' }}>
                      {msgs[1]}
                    </RouterGo>
                  </>
                );
              }}
            </FormattedMessage>
          </strong>
        </div>
        <div className={styles.tabLine}>
          <Tabs
            tabs={[
              <FormattedMessage id={'DepositRecords'} />,
              <FormattedMessage id={'WithdrawalRecords'} />,
              '锁仓记录',
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
