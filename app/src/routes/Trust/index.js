import React from 'react';
import { Mixin } from '../../components';
import * as styles from './index.less';
import { TableTitle } from '../components';
import { Inject } from '@utils';
import SettingTable from './SettingTable';

@Inject(({ trustStore: model, accountStore }) => ({ model, accountStore }))
class Trust extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getAllWithdrawalList' });
  };

  render() {
    const {
      accountStore: { isActiveValidator },
    } = this.props;

    return (
      <div className={styles.trust}>
        <TableTitle title={`信托设置`} className={styles.title}>
          <span>{`（您当前是：${isActiveValidator ? '验证' : '候选'}节点）`}</span>
        </TableTitle>
        {/*<WithdrawTable {...this.props} />*/}
        <SettingTable {...this.props} />
      </div>
    );
  }
}

export default Trust;
