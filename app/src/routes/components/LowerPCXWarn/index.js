import React, { Component } from 'react';
import ConfirmAndCancelModal from '../ConfirmAndCancelModal';
import * as styles from './index.less';

class LowerPCXWarn extends Component {
  render() {
    return (
      <ConfirmAndCancelModal {...this.props}>
        <div className={styles.LowerPCXWarn}>此操作将导致您的PCX余额过低，后续可能无法支付链上操作的手续费</div>
      </ConfirmAndCancelModal>
    );
  }
}

export default LowerPCXWarn;
