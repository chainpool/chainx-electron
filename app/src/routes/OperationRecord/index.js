import React from 'react';
import { Mixin } from '../../components';
import { BreadCrumb, TableTitle } from '../components';
import OperationTable from './OperationTable';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ assetStore: model }) => ({ model }))
class OperationRecord extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {};

  render() {
    const { activeIndex } = this.state;
    return (
      <div className={styles.operationRecord}>
        <BreadCrumb />
        <TableTitle title="操作记录" />
        {activeIndex === 0 ? <OperationTable {...this.props} /> : null}
      </div>
    );
  }
}

export default OperationRecord;
