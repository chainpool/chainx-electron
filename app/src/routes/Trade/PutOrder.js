import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import { Input, Slider } from '../../components';

import * as styles from './PutOrder.less';

class PutOrder extends SwitchPair {
  state = {
    buy: {
      action: 'buy',
      price: '',
      amount: '',
    },
    sell: {
      action: 'sell',
      price: '',
      amount: '',
    },
  };

  startInit = () => {};

  changeBS = (action = 'buy', payload = {}) => {
    this.setState({
      [action]: {
        ...this.state[action],
        ...payload,
      },
    });
  };

  renderArea = ({ direction: { price, amount, action } = {} }) => {
    const { changeBS } = this;
    const max = 100;
    const marks = {
      0: '',
      [max * 0.25]: '',
      [max * 0.5]: '',
      [max * 0.75]: '',
      [max]: '',
    };

    const sliderProps = {
      value: Number(amount),
      onChange: value => {
        changeBS(action, { amount: value });
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
            <Input.Text
              value={price}
              onChange={value => {
                changeBS(action, { price: value });
              }}
              suffix="BTC"
            />
          </div>
        </div>
        <div className={styles.useramount}>
          <div className={styles.amountlabel}>买入量</div>
          <div>
            <Input.Text
              value={amount}
              onChange={value => {
                changeBS(action, { amount: value });
              }}
              suffix="PCX">
              dsddd
            </Input.Text>
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
          <button className={styles[action]}>买入PCX</button>
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
          <div className={styles.title}>限价交易</div>
          <span>撮合手续费：0.00%</span>
        </div>
        <div className={styles.operation}>
          {renderArea(buyConfig)}
          <div className={styles.seperation} />
          {renderArea(sellConfig)}
        </div>
      </div>
    );
  }
}

export default PutOrder;
