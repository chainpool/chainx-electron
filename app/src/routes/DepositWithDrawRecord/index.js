import React from 'react';
import { Mixin } from '../../components';
import { BreadCrumb, Tab } from '../components';
import DepositTable from './DepositTable';
import WithDrawTable from './WithDrawTable';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ assetStore: model }) => ({ model }))
class DepositWithDrawRecord extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = this.loadData;

  loadData() {
    const {
      model: { dispatch },
    } = this.props;

    if (this.state.activeIndex === 0) {
      dispatch({ type: 'getDepositRecords' });
    } else {
      dispatch({ type: 'getWithdrawalList' });
    }
  }

  componentDidUpdate() {
    this.loadData();
  }

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
        {activeIndex === 0 ? <DepositTable {...this.props} /> : null}
        {activeIndex === 1 ? <WithDrawTable {...this.props} /> : null}
      </div>
    );
  }
}

export default DepositWithDrawRecord;
