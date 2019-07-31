import React, { Component } from 'react';
import { Modal } from '../../../components';
import * as styles from './ClaimConditionModal.less';
import { formatNumber, moment_helper } from '../../../utils';

class ClaimConditionModal extends Component {
  render() {
    const {
      globalStore: {
        modal: {
          data: { claimHeight, targetNominateAmount, blockNumber, reserved, intention },
        },
      },
      chainStore: { blockTime, blockDuration },
    } = this.props;

    let estimatedTime = 0;

    const showClaimHeight = claimHeight && claimHeight > blockNumber;
    if (showClaimHeight) {
      estimatedTime = blockTime.getTime() + blockDuration * (claimHeight - blockNumber);
    }

    const need = Number(targetNominateAmount) - Number(reserved);

    return (
      <Modal title={'提息条件'}>
        <div className={styles.ClaimConditionModal}>
          <div className={styles.grayBlock}>你的PCX投票冻结必须大于待领利息的10倍；且每次提息时间间隔不少于7天。</div>
          {showClaimHeight ? (
            <div className={styles.claimHeight}>
              下次可提息时间：{claimHeight}（预估 {moment_helper.formatHMS(estimatedTime, 'YYYY/MM/DD HH:mm:ss')}）
            </div>
          ) : null}
          {need > 0 ? (
            <div className={styles.pcxlock}>
              预估需要增加投票冻结：{formatNumber.toFixed(intention.need / Math.pow(10, 8), 8)} PCX
            </div>
          ) : null}
        </div>
      </Modal>
    );
  }
}

export default ClaimConditionModal;
