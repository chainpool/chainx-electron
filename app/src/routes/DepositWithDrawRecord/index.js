import React from 'react';
import { Mixin, Tabs, FormattedMessage, RouterGo } from '../../components';
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
        <div className={styles.notgetdeposit}>
          <strong>
            如果你的充值未到账，可能是OP_RETURN格式错误，需要重新绑定以领取，
            <RouterGo isOutSide go={{ pathname: 'https://scan.chainx.org/crossblocks/bitcoin/claim' }}>
              点击查看充值未认领列表
            </RouterGo>
          </strong>
        </div>
        <div className={styles.tabLine}>
          <Tabs tabs={[<FormattedMessage id={'DepositRecords'} />, <FormattedMessage id={'WithdrawalRecords'} />]}>
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
