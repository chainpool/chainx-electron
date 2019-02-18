import React from 'react';
import { Mixin } from '../../components';
import * as styles from './index.less';
import { TableTitle } from '../components';
import { Inject } from '@utils';
import SettingTable from './SettingTable';
import ImportHotPrivateKeyModal from './Modal/ImportHotPrivateKeyModal';
import NodeSettingModal from './Modal/NodeSettingModal';
import WithdrawTable from './WithdrawTable';

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
      globalStore: {
        modal: { name },
      },
    } = this.props;

    return (
      <div className={styles.trust}>
        <TableTitle title={`信托设置`} className={styles.title}>
          <span>{`（您当前是：${isActiveValidator ? '验证' : '候选'}节点）`}</span>
        </TableTitle>
        <SettingTable {...this.props} />
        <div className={styles.withdraw}>
          <TableTitle title={'提现列表'} className={styles.title} />
          <WithdrawTable {...this.props} />
        </div>
        {name === 'ImportHotPrivateKeyModal' ? <ImportHotPrivateKeyModal {...this.props} /> : null}
        {name === 'NodeSettingModal' ? <NodeSettingModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Trust;
