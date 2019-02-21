import React from 'react';
import { Mixin, ButtonGroup, Button, Icon } from '../../components';
import * as styles from './index.less';
import { TableTitle } from '../components';
import { Inject } from '@utils';
import SettingTable from './SettingTable';
import ImportHotPrivateKeyModal from './Modal/ImportHotPrivateKeyModal';
import NodeSettingModal from './Modal/NodeSettingModal';
import WithdrawTable from './WithdrawTable';
import WithdrawConstructModal from './Modal/WithdrawConstructModal';
import WithdrawSignModal from './Modal/WithdrawSignModal';
import TrustSetting from './Modal/TrustSetting';

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
      accountStore: { isTrustee, isActiveValidator, openModal },
      globalStore: {
        modal: { name },
      },
    } = this.props;

    return (
      <div className={styles.trust}>
        <TableTitle title={`信托设置`} className={styles.title}>
          <span>{`（您当前是：${isTrustee ? '信托' : isActiveValidator ? '验证' : '候选'}节点）`}</span>
          <Button
            onClick={() => {
              openModal({ name: 'TrustSetting' });
            }}>
            <Icon name="icon-shezhixintuo" />
            <span>设置信托</span>
          </Button>
        </TableTitle>
        <SettingTable {...this.props} />

        <div className={styles.withdraw}>
          <TableTitle title={'提现列表'} className={styles.withdrawTitle}>
            <ButtonGroup>
              <Button
                onClick={() => {
                  openModal({ name: 'WithdrawConstructModal' });
                }}>
                <Icon name="icon-goujiantixian" />
                构造多签提现
              </Button>
              <Button
                onClick={() => {
                  openModal({ name: 'WithdrawSignModal' });
                }}>
                <Icon name="icon-xiangyingtixian" />
                相应多签提现
              </Button>
            </ButtonGroup>
          </TableTitle>
          <WithdrawTable {...this.props} />
        </div>
        {name === 'ImportHotPrivateKeyModal' ? <ImportHotPrivateKeyModal {...this.props} /> : null}
        {name === 'NodeSettingModal' ? <NodeSettingModal {...this.props} /> : null}
        {name === 'WithdrawConstructModal' ? <WithdrawConstructModal {...this.props} /> : null}
        {name === 'WithdrawSignModal' ? <WithdrawSignModal {...this.props} /> : null}
        {name === 'TrustSetting' ? <TrustSetting {...this.props} /> : null}
      </div>
    );
  }
}

export default Trust;
