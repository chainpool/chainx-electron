import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import { Input, Slider } from '../../components';
import { HoverTip } from '../components';

import * as styles from './PutOrder.less';

class PutOrder extends SwitchPair {
  state = {
    sliderBuyAmount: '',
    buy: {
      price: '',
      amount: '',
      slider: '',
    },
    sell: {
      price: '',
      amount: '',
      slider: '',
    },
  };

  startInit = () => {};

  renderArea = ({ direction: { price, amount } = {} }) => {
    const { sliderBuyAmount } = this.state;
    const max = 100;
    const marks = {
      0: '',
      [max * 0.25]: '',
      [max * 0.5]: '',
      [max * 0.75]: '',
      [max]: '',
    };

    const sliderProps = {
      value: Number(sliderBuyAmount),
      onChange: v => {
        this.setState({
          sliderBuyAmount: v,
        });
      },
      marks: marks,
      max: max,
      defaultValue: 0,
      step: 1,
      disabled: false,
    };

    return (
      <div className={styles.user}>
        <div className={styles.freebalance}>
          可用余额:
          <span>
            0.3<span>BTC</span>
          </span>
        </div>
        <div className={styles.userprice}>
          <div className={styles.pricelabel}>买入价</div>
          <div>
            <Input.Text suffix="BTC">dsddd</Input.Text>
          </div>
        </div>
        <div className={styles.useramount}>
          <div className={styles.amountlabel}>买入量</div>
          <div>
            <Input.Text suffix="PCX">dsddd</Input.Text>
          </div>
        </div>
        <div className={styles.slider}>
          <Slider {...sliderProps} />
          <div>
            <span>
              0<span>PCX</span>
            </span>
            <span>
              3000<span>PCX</span>
            </span>
          </div>
        </div>
        <div className={styles.totalPrice}>交易额 0.1BTC</div>
        <div className={styles.submit}>
          <button>买入PCX</button>
        </div>
      </div>
    );
  };

  render() {
    const { renderArea } = this;
    const { buy, sell } = this.state;
    const buyConfig = {
      direction: buy,
    };
    const sellConfig = {
      direction: sell,
    };
    return (
      <div className={styles.putOrder}>
        <div className={styles.header}>
          <span>交易手续费:</span>Maker(<del>0.05%</del> 0.03%) Taker (<del>0.1%</del> 0.06%)
          <HoverTip>解释</HoverTip>
        </div>
        <div className={styles.operation}>
          {renderArea(buyConfig)}
          {renderArea(sellConfig)}
        </div>
      </div>
    );
  }
}

export default PutOrder;
