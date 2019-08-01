import React, { Component } from 'react';
import { Modal } from '../../../components';
import { Warn } from '../../components';
import * as styles from './ClaimConditionModal.less';
import { formatNumber, moment_helper } from '../../../utils';

class ClaimConditionModal extends Component {
  render() {
    const {
      globalStore: {
        modal: {
          data: { claimHeight, blockNumber, intention },
        },
      },
    } = this.props;

    const showClaimHeight = intention.nextClaim && intention.nextClaim > blockNumber;

    const ok = <p className={styles.ok}>已完成</p>;
    const nextClaim = (
      <p>
        块高 {claimHeight}(预估 {moment_helper.formatHMS(intention.nextClaimTimestamp, 'YYYY/MM/DD HH:mm:ss')})
      </p>
    );

    const estimatedLock = <p>预估需要增加投票冻结：{formatNumber.toFixed(intention.need / Math.pow(10, 8), 8)} PCX</p>;

    return (
      <Modal title={'提息条件'}>
        <div className={styles.ClaimConditionModal}>
          <div className={styles.items}>
            <section className={styles.nextClaimHeight}>
              <div>下次可提息时间</div>
              {showClaimHeight ? nextClaim : ok}
            </section>
            <section className={styles.estimatedLockedPcx}>
              <div>预估需要增加投票冻结</div>
              {typeof intention.need === 'number' && intention.need > 0 ? estimatedLock : ok}
            </section>
          </div>

          <Warn>
            <ol>
              <li>1，你的PCX投票冻结必须大于等于挖矿收益（包含推荐渠道收益）的10倍.</li>
              <li>2，每次提息时间间隔不少于7天.</li>
            </ol>
          </Warn>
        </div>
      </Modal>
    );
  }
}

export default ClaimConditionModal;
