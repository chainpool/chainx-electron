import React, { Component } from 'react';
import { Modal, Button, FormattedMessage, Icon } from '../../../components/index';
import * as styles from './StopDepositModal.less';

class StopDepositModal extends Component {
  render() {
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title={
          <div className={styles.jinggaoicon}>
            <Icon name="icon-jinggao" />
            暂停充值功能通知
          </div>
        }
        className={styles.group}
        button={
          <div className={styles.stopDepositModal}>
            <Button
              type="confirm"
              size="full"
              onClick={() => {
                closeModal();
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          </div>
        }>
        <div className={styles.desc}>
          ChainX上线一周，其创新的共识分发方式得到了社区用户和行业的广泛关注和参与，BTC跨链充值屡创新高。但由于BTC增长太快，而ChainX仍然处于初期,
          导致链上BTC资产远远超过PCX流通市值，ChainX共识暂未能承载如此的BTC资产规模,
          信托人还需要进一步扩大和完善等，为了能够让ChainX更加健康可持续地发展，经ChainX议会决定:
          <ul>
            <li>1. 暂停BTC充值, 只开放BTC提现功能。</li>
            <li>
              2. BTC挖矿算力由之前兑PCX价格的5折调整为1折，这将降低 80% 的BTC充值挖矿收益,
              同时增加DOT映射挖矿和PCX投票挖矿的权重。
            </li>
          </ul>
          <p>
            BTC大额提现(大于5BTC)推荐提现至充值来源地址，而非各类交易所地址，这将会加快信托人的审核速度，加速提现处理。推荐BTC大额用户提走一部分，仅剩少量参与体验。
          </p>
          <p>
            用户所有资产都是安全的,
            可以随时提现。感谢广大社区用户支持，等待进一步扩大链的共识和完善信托后ChainX将会再次开启BTC充值，具体时间请关注社区公告。
          </p>
        </div>
      </Modal>
    );
  }
}

export default StopDepositModal;
