import React from 'react';
import { Clipboard, Mixin, Modal, FormattedMessage, RouterGo } from '../../../components';
import { Warn } from '../../components';
import * as styles from './DepositModal.less';
import { Inject } from '../../../utils';
import QRious from 'qrious';

@Inject(({ assetStore }) => ({ assetStore }))
class DepositModal extends Mixin {
  startInit = () => {
    const {
      model: { dispatch },
      globalStore: {
        modal: {
          data: { chain },
        },
      },
    } = this.props;
    dispatch({ type: 'getAccountBTCAddresses' });
    dispatch({ type: 'getTrusteeAddress', payload: { chain } }).then(res => {
      if (res) {
        new QRious({
          size: 112,
          element: document.getElementById('qr'),
          value: res,
        });
      }
    });
  };

  render() {
    const {
      model: { openModal },
      assetStore: { btcAddresses = [], btcTrusteeAddress },
    } = this.props;

    return (
      <Modal title={<FormattedMessage id={'CrossChainDeposit'} />}>
        <div className={styles.bindAddress}>
          <div>
            <FormattedMessage id={'BindedAddress'} />
            <button
              onClick={() => {
                openModal({
                  name: 'CrossChainBindModal',
                  data: {
                    token: 'BTC',
                  },
                });
              }}>
              <FormattedMessage id={'BindNewAddress'} />
            </button>
          </div>
          <ul>
            {btcAddresses.map((address, index) => {
              return (
                <li key={index}>
                  <span>Bitcoin:</span>
                  <div>{address}</div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.publicAddress}>
          <div>
            <div className={styles.title}>
              <FormattedMessage id={'PublicMultiSigTrusteeAddress'} />
            </div>
            <div className={styles.address}>
              <span className={styles.token}>Bitcoin:</span>
              <Clipboard>{btcTrusteeAddress}</Clipboard>
            </div>
            <Warn>
              <div>
                <FormattedMessage id={'BTCBindWWarn'} />
                <RouterGo
                  isOutSide
                  go={{
                    pathname:
                      'https://github.com/chainx-org/ChainX/wiki/%E5%85%85%E5%80%BC%E6%8C%96%E7%9F%BF#%E5%85%85%E5%80%BC%E5%A5%96%E5%8A%B1',
                  }}
                  style={{ fontWeight: 'bold' }}>
                  查看充值奖励规则
                </RouterGo>
              </div>
            </Warn>
          </div>
          <div className={styles.back}>
            <canvas id="qr" />
          </div>
        </div>
      </Modal>
    );
  }
}

export default DepositModal;
