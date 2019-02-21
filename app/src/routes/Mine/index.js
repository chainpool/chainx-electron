import React from 'react';
import { Mixin } from '../../components';
import { TableTitle } from '../components';
import DepositMineTable from './DepositMineTable.js';
import * as styles from './index.less';
import { Inject } from '../../utils';

@Inject(({ electionStore: model }) => ({ model }))
class Asset extends Mixin {
  render() {
    return (
      <div className={styles.mine}>
        <ul>
          <li>
            <TableTitle title={'充值挖矿'} />
            <DepositMineTable {...this.props} />
          </li>
        </ul>
      </div>
    );
  }
}

export default Asset;
