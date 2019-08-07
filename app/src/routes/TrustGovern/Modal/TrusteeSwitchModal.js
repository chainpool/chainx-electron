import React, { Component } from 'react';
import { Button, FormattedMessage, Modal } from '../../../components';
import * as styles from './TrusteeSwitchModal.less';
import { observer } from '../../../utils';

@observer
class TrusteeSwitchModal extends Component {
  render() {
    const {
      model: { openModal, dispatch },
      globalStore: {
        modal: {
          data: { addrs, mockResult },
        },
      },
    } = this.props;

    return (
      <Modal
        scroll={false}
        title={<div>信托换届</div>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              openModal({
                name: 'SignModal',
                data: {
                  description: [{ name: 'operation', value: '发起提议' }],
                  callback: () => {
                    return dispatch({
                      type: 'trusteeGovernExecute',
                      payload: {
                        addrs,
                      },
                    });
                  },
                },
              });
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.TrusteeSwitchModal}>
          <div className={styles.top}>
            模拟多签热地址:
            <div className={styles.address}>{mockResult.coldEntity.addr}</div>
            模拟多签热赎回脚本:
            <div className={styles.redescript}>{mockResult.coldEntity.redeemScript}</div>
            模拟多签冷地址:
            <div className={styles.address}>{mockResult.hotEntity.addr}</div>
            模拟多签冷赎回脚本:
            <div className={styles.redescript}>{mockResult.hotEntity.redeemScript}</div>
          </div>
          <div className={styles.down}>
            <ul>
              {mockResult.trusteeList.map((item, index) => (
                <li key={index}>
                  <div className={styles.name}>nuildlinks</div>
                  <div>
                    <span>地址：</span>
                    <div>{item.accountId}</div>
                  </div>
                  <div>
                    <span>热公钥：</span>
                    <div>{item.props.hotEntity}</div>
                  </div>
                  <div>
                    <span>冷公钥:</span>
                    <div>{item.props.coldEntity}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    );
  }
}

export default TrusteeSwitchModal;
