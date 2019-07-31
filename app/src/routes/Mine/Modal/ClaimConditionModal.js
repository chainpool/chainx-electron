import React, { Component } from 'react';
import { Modal } from '../../../components';
import * as styles from './ClaimConditionModal.less';

class ClaimConditionModal extends Component {
  render() {
    const {
      globalStore: {
        modal: {
          data: { claimHeight, targetNominateAmount, blockNumber },
        },
      },
    } = this.props;

    const showClaimHeight = claimHeight && claimHeight > blockNumber;

    return (
      <Modal title={'提息条件'}>
        <div className={styles.ClaimConditionModal}>
          <div className={styles.grayBlock}>你的PCX投票冻结必须大于待领利息的10倍；且每次提息时间间隔不少于7天</div>
          {showClaimHeight ? (
            <div className={styles.claimHeight}>
              下次可提息高度：{claimHeight}（预估 {claimHeight}）
            </div>
          ) : null}
          <div className={styles.pcxlock}>预估最低PCX投票冻结：{targetNominateAmount}</div>
        </div>
      </Modal>
    );
  }
}

export default ClaimConditionModal;
