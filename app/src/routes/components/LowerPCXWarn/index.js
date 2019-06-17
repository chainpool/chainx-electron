import React, { Component } from 'react';
import ConfirmAndCancelModal from '../ConfirmAndCancelModal';
import * as styles from './index.less';
import { FormattedMessage } from '../../../components';

class LowerPCXWarn extends Component {
  render() {
    return (
      <ConfirmAndCancelModal {...this.props}>
        <div className={styles.LowerPCXWarn}>
          <FormattedMessage id={'OperationResultBalanceTooLow'} />
        </div>
      </ConfirmAndCancelModal>
    );
  }
}

export default LowerPCXWarn;
