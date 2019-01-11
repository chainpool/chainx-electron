import React, { Component } from 'react';
import { Modal, RouterGo, Scroller } from '../../../components';
import * as styles from './GetCollarModal.less';
import getcollar_1 from '../../../resource/getcollar_1.png';
import getcollar_2 from '../../../resource/getcollar_2.png';
import getcollar_3 from '../../../resource/getcollar_3.png';
import getcollar_4 from '../../../resource/getcollar_4.png';

class GetCollarModal extends Component {
  render() {
    return (
      <Modal title="领币">
        <div className={styles.getCollarModal}>
          <Scroller scroll={{ y: 500 }}>
            <div className={styles.desc}>
              <div />
              创建测试网钱包
            </div>
            <div className={styles.grayblock}>
              <div>
                ChainX连接了比特币的官方公共测试链 testnet3，您可以使用任何支持
                testnet3的钱包和账户地址（目前只支持普通地址，后续支持隔离见证地址）进行测试。
              </div>
              <div>
                如果您没有测试网钱包，推荐下载https://bitpay.com/wallet，下载后点击Create personal
                wallet，Coin选择Bitcoin(BTC)，advanced options选择Testnet即可创建一个testnet3地址。
              </div>
              <div className={styles.img}>
                <img src={getcollar_1} alt="getcollar_1" />
                <img src={getcollar_2} alt="getcollar_2" />
              </div>
            </div>
            <div className={styles.desc}>
              <div />
              领取测试币
            </div>
            <div className={styles.grayblock}>
              <div>
                将自己的测试网账户地址，拿到网上的水龙头网站领取一些测试币，如：
                <RouterGo
                  isOutSide
                  go={{
                    pathname: 'https://coinfaucet.eu/en/btc-testnet/',
                  }}>
                  https://coinfaucet.eu/en/btc-testnet/，
                </RouterGo>
                <RouterGo
                  isOutSide
                  go={{
                    pathname: 'http://bitcoinfaucet.uo1.net/',
                  }}>
                  http://bitcoinfaucet.uo1.net/
                </RouterGo>
              </div>
            </div>
            <div className={styles.desc}>
              <div />
              导出账户私钥
            </div>
            <div className={styles.grayblock}>
              <div>
                目前BitPay以及绝大多数比特币钱包均不支持自定义OP_RETURN，转账时的备注仅仅是钱包本地的记录存储。比特币上的正常转账交易如果要附带跨链信息，则只能填写在OP_RETURN中，所以需要导出账户私钥到专门的OP_RETURN工具中拼接跨链交易。
              </div>
              <div className={styles.img}>
                <img src={getcollar_3} alt="getcollar_3" />
                <img src={getcollar_4} alt="getcollar_4" />
              </div>
            </div>
          </Scroller>
        </div>
      </Modal>
    );
  }
}

export default GetCollarModal;
