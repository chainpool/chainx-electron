import React, { Component } from 'react';
import { Modal } from '../../../components';
import { Warn } from '../../components';
import * as styles from './ClaimConditionModal.less';
import { formatNumber, moment_helper } from '../../../utils';
import FormattedMessage from '@components/FormattedMessage';

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

    const ok = (
      <p className={styles.ok}>
        <FormattedMessage id={'Satisfied'} />
      </p>
    );
    const nextClaim = (
      <p>
        <FormattedMessage
          id={'CrossChainNextClaimDetail'}
          values={{
            claimHeight,
            claimTime: moment_helper.formatHMS(intention.nextClaimTimestamp, 'YYYY/MM/DD HH:mm:ss'),
          }}
        />
      </p>
    );

    const estimatedLock = <p>预估需要增加投票冻结：{formatNumber.toFixed(intention.need / Math.pow(10, 8), 8)} PCX</p>;

    return (
      <Modal title={<FormattedMessage id={'CrossChainClaimRequirements'} />}>
        <div className={styles.ClaimConditionModal}>
          <div className={styles.items}>
            <section className={styles.nextClaimHeight}>
              <div>
                <FormattedMessage id={'CrossChainNextClaimTime'} />
              </div>
              {showClaimHeight ? nextClaim : ok}
            </section>
            <section>
              <div>
                <FormattedMessage id={'CrossChainEstimatedAddBonded'} />
              </div>
              {typeof intention.need === 'number' && intention.need > 0 ? estimatedLock : ok}
            </section>
          </div>

          <Warn>
            <ol>
              <li>
                <FormattedMessage id={'CrossChainClaimRequirement1'} />
              </li>
              <li>
                <FormattedMessage id={'CrossChainClaimRequirement2'} />
              </li>
            </ol>
          </Warn>
        </div>
      </Modal>
    );
  }
}

export default ClaimConditionModal;
