import React from 'react';
import { Mixin } from '../../components';
import { TableTitle } from '../components';
import TradeTable from './TradeTable';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ tradeRecordStore: model }) => ({ model }))
class TradeRecord extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {};

  render() {
    const { activeIndex } = this.state;
    return (
      <div className={styles.tradeRecord}>
        <TableTitle title="交易记录" />
        {activeIndex === 0 ? <TradeTable {...this.props} /> : null}
      </div>
    );
  }
}

export default TradeRecord;
