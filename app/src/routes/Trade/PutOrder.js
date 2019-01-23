import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import { Button, ButtonGroup, Input, Slider, Toast } from '../../components';
import { Inject, Patterns, formatNumber, toJS } from '../../utils';
import * as styles from './PutOrder.less';

@Inject(({ assetStore }) => ({ assetStore }))
class PutOrder extends SwitchPair {
  state = {
    buy: {
      action: 'buy',
      price: '0.00001',
      priceErrMsg: '',
      amount: '0.001',
      amountErrMsg: '',
      tradeErrMsg: '',
    },
    sell: {
      action: 'sell',
      price: '0.00001',
      priceErrMsg: '',
      amount: '0.001',
      amountErrMsg: '',
      tradeErrMsg: '',
    },
  };

  checkAll = {
    checkTotal: action => {
      const { price, amount } = this.state[action];
      const {
        model: { setPrecision },
      } = this.props;
      const errMsg = Patterns.check('smaller')(setPrecision(1, this.getMaxTradePrecision()), price * amount);
      const err = errMsg ? '交易额太小' : '';
      this.changeBS(action, { tradeErrMsg: err });
      return err;
    },
    checkPrice: action => {
      const { price } = this.state[action];
      const {
        model: { currentPair },
      } = this.props;
      const errMsg = Patterns.check('required')(price) || Patterns.check('precision')(price, currentPair.precision);
      this.changeBS(action, { priceErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: action => {
      const { amount, price } = this.state[action];
      const {
        model: { currentPair },
      } = this.props;
      const errMsg =
        Patterns.check('required')(amount) ||
        Patterns.check('precision')(amount, currentPair.assetsPrecision) ||
        Patterns.check('smaller')(amount, this.getMaxAmount(action, price), '数量不足');
      this.changeBS(action, { amountErrMsg: errMsg });
      return errMsg;
    },

    confirm: action => {
      return ['checkPrice', 'checkAmount', 'checkTotal'].every(item => !this.checkAll[item](action));
    },
  };

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getAccountAssets',
    });
  };

  changeBS = (action = 'buy', payload = {}) => {
    this.setState({
      [action]: {
        ...this.state[action],
        ...payload,
      },
    });
  };

  getCurrentAssetFree = () => {
    const {
      model: { currentPair },
      assetStore: { crossChainAsset = [], primaryAsset = [] },
    } = this.props;
    const currentCrossAsset = crossChainAsset.filter((item = {}) => item.name === currentPair.currency)[0] || {};
    const currentPrimaryAsset = primaryAsset.filter((item = {}) => item.name === currentPair.assets)[0] || {};
    return [currentCrossAsset.Free, currentPrimaryAsset.Free];
  };

  getMaxAmount = (action, price) => {
    price = price > 0 ? price : 1;
    const {
      model: { currentPair, setPrecision },
    } = this.props;
    const [currentCrossAssetFree, currentPrimaryAssetFree] = this.getCurrentAssetFree();
    return action === 'buy'
      ? setPrecision(currentCrossAssetFree / price, currentPair.currency)
      : setPrecision(currentPrimaryAssetFree, currentPair.assets);
  };

  getMaxTradePrecision = () => {
    const {
      model: { currentPair, getPrecision },
    } = this.props;
    // 交易额的精度要用资产自身的精度
    return Math.max(getPrecision(currentPair.currency), currentPair.assetsPrecision);
  };

  renderArea = ({ direction: { price, amount, action } = {}, label }) => {
    const { changeBS, checkAll } = this;
    const {
      model: { isLogin, openModal, dispatch, currentPair, setPrecision, getPrecision },
    } = this.props;
    const { priceErrMsg, amountErrMsg, tradeErrMsg } = this.state[action];
    const [currentCrossAssetFree, currentPrimaryAssetFree] = this.getCurrentAssetFree();
    const max = +this.getMaxAmount(action, price);
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
      step: +setPrecision(1, currentPair.assets),
      disabled: false,
    };

    return (
      <div className={styles.user}>
        <div className={styles.freebalance}>
          可用余额:{' '}
          <span>
            {action === 'buy'
              ? setPrecision(currentCrossAssetFree, currentPair.currency) || '-'
              : setPrecision(currentPrimaryAssetFree, currentPair.assets) || '-'}
            <span>{action === 'buy' ? currentPair.currency : currentPair.assets}</span>
          </span>
        </div>
        <div className={styles.userprice}>
          <div className={styles.pricelabel}>{label}价</div>
          <div className={styles.input}>
            <Input.Text
              type="decimal"
              errMsg={priceErrMsg}
              value={price}
              onChange={value => {
                changeBS(action, { price: value });
              }}
              onBlur={() => {
                checkAll.checkPrice(action);
                setTimeout(() => {
                  checkAll.checkTotal(action);
                });
              }}
              suffix={currentPair.currency}
            />
          </div>
        </div>
        <div className={styles.useramount}>
          <div className={styles.amountlabel}>{label}量</div>
          <div className={styles.input}>
            <Input.Text
              type="decimal"
              errMsg={amountErrMsg}
              value={amount}
              onChange={value => {
                changeBS(action, { amount: value });
              }}
              onBlur={() => {
                checkAll.checkAmount(action);
                setTimeout(() => {
                  checkAll.checkTotal(action);
                });
              }}
              suffix={currentPair.assets}
            />
          </div>
        </div>
        <div className={styles.slider}>
          <Slider {...sliderProps} />
          <div>
            <span>
              0<span>{currentPair.assets}</span>
            </span>
            <span>
              {max}
              <span>{currentPair.assets}</span>
            </span>
          </div>
        </div>
        <div className={styles.totalPrice}>
          交易额 {formatNumber.toFixed(price * amount, this.getMaxTradePrecision())} {currentPair.currency}{' '}
          {!priceErrMsg && !amountErrMsg && tradeErrMsg ? (
            <div className={styles.tradeErrMsg}>{tradeErrMsg}</div>
          ) : null}
        </div>
        {isLogin() ? (
          <div className={styles.submit}>
            <button
              className={styles[action]}
              onClick={() => {
                if ((checkAll.confirm(action) && !tradeErrMsg) || true) {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [{ name: '操作', value: '交易' }],
                      callback: ({ signer, acceleration }) => {
                        dispatch({
                          type: 'putOrder',
                          payload: {
                            signer,
                            acceleration,
                            pairId: currentPair.id,
                            orderType: 'Limit',
                            direction: action === 'buy' ? 'Buy' : 'Sell',
                            price,
                            amount,
                          },
                        }).then(res => {
                          if (res) {
                            Toast.success(
                              '挂单已完成',
                              <div>
                                交易对 {`${currentPair.assets} / ${currentPair.currency}`}; 方向{' '}
                                {action === 'buy' ? '买入' : '卖出'}；报价 {price}
                                <br />
                                数量 {amount}
                              </div>
                            );
                          }
                        });
                      },
                    },
                  });
                }
              }}>
              {label}
              {currentPair.assets}
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  render() {
    const { renderArea } = this;
    const { buy, sell } = this.state;
    const {
      model: { openModal, isLogin },
    } = this.props;
    const buyConfig = {
      direction: buy,
      label: '买入',
    };
    const sellConfig = {
      direction: sell,
      label: '卖出',
    };
    return (
      <div className={styles.putOrder}>
        <div className={styles.header}>
          <div className={styles.title}>限价交易</div>
          <span>撮合手续费：0.00%</span>
        </div>
        <div className={styles.operation}>
          <div className={styles.top}>
            {renderArea(buyConfig)}
            <div className={styles.seperation} />
            {renderArea(sellConfig)}
          </div>
          {!isLogin() ? (
            <div className={styles.download}>
              <span>请先设置账户</span>
              <ButtonGroup>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'ImportAccountModal',
                    });
                  }}>
                  导入账户
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'CreateAccountModal',
                    });
                  }}>
                  新增账户
                </Button>
                <Button type="warn">下载钱包</Button>
              </ButtonGroup>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default PutOrder;
