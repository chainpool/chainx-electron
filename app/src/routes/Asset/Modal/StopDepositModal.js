import React, { Component } from 'react';
import { Modal, Button, FormattedMessage, Icon, LanguageContent } from '../../../components';
import * as styles from './StopDepositModal.less';
import { LowerPCXWarn } from '../../components';

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
            <LanguageContent zh={'暂停充值功能通知'} en={'Notification: BTC deposit suspension'} />
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
          <LanguageContent
            zh={
              'ChainX上线一周，其创新的共识分发方式得到了社区用户和行业的广泛关注和参与，BTC跨链充值屡创新高。但由于BTC增长太快，而ChainX仍然处于初期,导致链上BTC资产远远超过PCX流通市值，ChainX共识暂未能承载如此的BTC资产规模,信托人还需要进一步扩大和完善等，为了能够让ChainX更加健康可持续地发展，经ChainX议会决定:'
            }
            en={
              'ChainX went into service just a week ago, but its innovative consensus distribution gained widespread recognition and participation from the community, with BTC cross-chain deposit setting new records. However, ChainX which is still at a very early stage is inundated by the rapid growth of BTC, which leads to BTC assets on the chain far exceeding the current market value of PCX. Whereas ChainX consensus is not yet able to carry such high volume of BTC assets before improvements being made to the trustee. In order to secure a healthy and sustainable future development for ChainX, the following decisions are made:'
            }
          />

          <ul>
            <li>
              <LanguageContent
                zh={'1. 暂停BTC充值, 只开放BTC提现功能。'}
                en={'1. Suspend BTC deposit  and only allow BTC withdrawal.'}
              />
            </li>
            <li>
              <LanguageContent
                zh={
                  '2. BTC挖矿算力由之前兑PCX价格的5折调整为1折，这将降低 80% 的BTC充值挖矿收益,同时增加DOT映射挖矿和PCX投票挖矿的权重。'
                }
                en={
                  '2. The mining power of BTC is adjusted from the previous discount of 50% to 90% of PCX price, which will affect 80% BTC top up’s mining income negatively and increase the weight of DOT mapping mining and PCX voting mining.'
                }
              />
            </li>
          </ul>
          <p>
            <LanguageContent
              zh={
                'BTC大额提现(大于5BTC)推荐提现至充值来源地址，而非各类交易所地址，这将会加快信托人的审核速度，加速提现处理。推荐BTC大额用户提走一部分，仅剩少量参与体验。'
              }
              en={
                'BTC withdrawal in large amounts (larger than 5BTC) is recommended to withdraw to the address of deposit, rather than the address of various exchanges to speed up both the audit and withdrawal processes . It is highly recommended that users with large amount of BTC withdraw most of the assets, leaving only a small amount to participate.'
              }
            />
          </p>
          <p>
            <LanguageContent
              zh={
                '用户所有资产都是安全的,可以随时提现。感谢广大社区用户支持，等待进一步扩大链的共识和完善信托后ChainX将会再次开启BTC充值，具体时间请关注社区公告。'
              }
              en={
                "All user's assets are secure and can be withdrawn at any time. Thank you for your support. ChainX will open BTC deposit again after further expansion on consensus and improvements to trustee being made. For more information, please pay attention to further notification."
              }
            />
          </p>
        </div>
      </Modal>
    );
  }
}

export default StopDepositModal;
