import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import { Button, ButtonGroup, Input, Slider } from '../../components';
import { _, Inject, Patterns, formatNumber, classNames } from '../../utils';
import * as styles from './PutOrder.less';

@Inject(({ assetStore, tradeStore }) => ({ assetStore, tradeStore }))
class PutOrder extends SwitchPair {
  state = {
    buy: {
      action: 'buy',
      price: '',
      priceErrMsg: '',
      amount: '',
      amountErrMsg: '',
      tradeErrMsg: '',
    },
    sell: {
      action: 'sell',
      price: '',
      priceErrMsg: '',
      amount: '',
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
      if (amount !== '' && price) {
        const errMsg = Patterns.check('smaller')(setPrecision(1, this.getMaxTradePrecision()), price * amount);
        const err = errMsg ? '交易额太小' : '';
        this.changeBS(action, { tradeErrMsg: err });
        return err;
      }
    },
    checkPrice: (action, callback) => {
      const { price } = this.state[action];
      const {
        model: { currentPair },
      } = this.props;
      const errMsg =
        Patterns.check('required')(price) ||
        Patterns.check('precision')(price, currentPair.precision - currentPair.unitPrecision) ||
        action === 'buy'
          ? Patterns.check('smallerOrEqual')(
              price,
              currentPair.maxLastPriceShow,
              `最高 ${currentPair.maxLastPriceShow}`
            )
          : Patterns.check('smallerOrEqual')(
              currentPair.minLastPriceShow,
              price,
              `最低 ${currentPair.minLastPriceShow}`
            );
      this.changeBS(action, { priceErrMsg: errMsg }, callback);
      return errMsg;
    },
    checkAmount: (action, callback) => {
      const { amount, price } = this.state[action];
      const {
        model: { currentPair },
      } = this.props;
      const errMsg =
        Patterns.check('required')(amount) ||
        Patterns.check('precision')(amount, currentPair.assetsPrecision) ||
        Patterns.check('smallerOrEqual')(amount, this.getMaxAmount(action, price), '数量不足');
      this.changeBS(action, { amountErrMsg: errMsg }, callback);
      return errMsg;
    },

    confirm: action => {
      return ['checkPrice', 'checkAmount', 'checkTotal'].every(item => !this.checkAll[item](action));
    },
  };

  startInit = () => {
    const {
      model: { currentPair, setPrecision, dispatch },
      tradeStore: { showUnitPrecision },
    } = this.props;
    dispatch({
      type: 'getAccountAssets',
    });
    const prev = {
      amount: '',
      priceErrMsg: '',
      amountErrMsg: '',
      tradeErrMsg: '',
    };
    this.changeBS('buy', {
      price: showUnitPrecision(currentPair.precision, currentPair.unitPrecision)(
        setPrecision(currentPair.lastPrice, currentPair.precision)
      ),
      ...prev,
    });
    this.changeBS('sell', {
      price: showUnitPrecision(currentPair.precision, currentPair.unitPrecision)(
        setPrecision(currentPair.lastPrice, currentPair.precision)
      ),
      ...prev,
    });
  };

  changeBS = (action = 'buy', payload = {}, callback) => {
    this.setState(
      {
        [action]: {
          ...this.state[action],
          ...payload,
        },
      },
      () => {
        _.isFunction(callback) && callback();
      }
    );
  };

  getCurrentAssetFree = () => {
    const {
      model: { currentPair },
      assetStore: { crossChainAccountAssets = [], nativeAccountAssets = [] },
    } = this.props;

    const assetsAll = crossChainAccountAssets.concat(nativeAccountAssets);
    const currentCurrencyAsset = assetsAll.filter((item = {}) => item.name === currentPair.currency)[0] || {};
    const currentAssetsAsset = assetsAll.filter((item = {}) => item.name === currentPair.assets)[0] || {};
    return [currentCurrencyAsset.free, currentAssetsAsset.free];
  };

  getMaxAmount = (action, price) => {
    price = price > 0 ? price : 1;
    const {
      model: { currentPair, setPrecision },
    } = this.props;
    const [currentCurrencyAssetFree, currentAssetsAssetFree] = this.getCurrentAssetFree();
    return action === 'buy'
      ? setPrecision(currentCurrencyAssetFree / price, currentPair.assets)
      : setPrecision(currentAssetsAssetFree, currentPair.assets);
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
      model: { isLogin, openModal, dispatch, currentPair, setPrecision, loading },
      accountStore: { currentAccount },
    } = this.props;
    const { priceErrMsg, amountErrMsg, tradeErrMsg } = this.state[action];
    const [currentCurrencyAssetFree, currentAssetsAssetFree] = this.getCurrentAssetFree();
    const max = this.getMaxAmount(action, price);
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
        changeBS(action, { amount: value }, () => {
          checkAll.checkAmount(action, () => {
            checkAll.checkTotal(action);
          });
        });
      },
      marks: marks,
      max: +max,
      defaultValue: 0,
      step: setPrecision(1, currentPair.assets),
      disabled: false,
    };

    const loadingAction = action === 'buy' ? 'putOrderBuy' : 'putOrderSell';
    return (
      <div className={styles.user}>
        <div className={styles.freebalance}>
          可用余额:{' '}
          <span>
            {action === 'buy'
              ? setPrecision(currentCurrencyAssetFree, currentPair.currency) || '-'
              : setPrecision(currentAssetsAssetFree, currentPair.assets) || '-'}{' '}
            <span>{action === 'buy' ? currentPair.currency : currentPair.assets}</span>
          </span>
        </div>
        <div className={styles.userprice}>
          <div className={styles.pricelabel}>{label}价</div>
          <div className={styles.input}>
            <Input.Text
              errMsgSuffix
              errMsg={priceErrMsg}
              value={price}
              precision={currentPair.precision - currentPair.unitPrecision}
              onChange={value => {
                changeBS(action, { price: value });
              }}
              onBlur={() => {
                checkAll.checkPrice(action, () => {
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
              errMsgIsOutside
              errMsgSuffix
              errMsg={amountErrMsg}
              value={amount}
              precision={currentPair.assetsPrecision}
              onChange={value => {
                changeBS(action, { amount: value });
              }}
              onBlur={() => {
                checkAll.checkAmount(action, () => {
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
          {tradeErrMsg ? <div className={styles.tradeErrMsg}>{tradeErrMsg}</div> : null}
        </div>
        {isLogin() ? (
          <div className={styles.submit}>
            <Button
              loading={loading[loadingAction]}
              className={classNames(styles[action], loading[loadingAction] ? styles.loading : null)}
              onClick={() => {
                if (checkAll.confirm(action) && !tradeErrMsg) {
                  const content = (
                    <div>
                      交易对 {`${currentPair.assets} / ${currentPair.currency}`}; 方向{' '}
                      {action === 'buy' ? '买入' : '卖出'}；报价 {price}
                      <br />
                      数量 {amount}
                    </div>
                  );
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [
                        { name: '操作', value: '交易' },
                        { name: '交易对', value: `${currentPair.assets}/${currentPair.currency}` },
                        { name: '方向', value: action === 'buy' ? '买入' : '卖出' },
                        { name: '报价', value: price },
                        { name: '账户', value: currentAccount.address },
                      ],
                      callback: () => {
                        return dispatch({
                          type: 'putOrder',
                          payload: {
                            pairId: currentPair.id,
                            orderType: 'Limit',
                            direction: action === 'buy' ? 'Buy' : 'Sell',
                            price,
                            amount,
                            successToast: {
                              message: content,
                            },
                            failToast: {
                              message: content,
                            },
                          },
                        });
                      },
                    },
                  });
                }
              }}>
              {label} {currentPair.assets}
            </Button>
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
