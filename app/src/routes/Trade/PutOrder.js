import React from 'react';
import SwitchPair from './Mixin/SwitchPair';
import { Button, ButtonGroup, Input, Slider, FormattedMessage } from '../../components';
import { _, Patterns, formatNumber, classNames, setBlankSpace, observer } from '../../utils';
import * as styles from './PutOrder.less';

@observer
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
        const errMsg = Patterns.check('smallerOrEqual')(setPrecision(1, this.getMaxTradePrecision()), price * amount);
        const err = errMsg ? <FormattedMessage id={'TradingVolumeTooSmall'} /> : '';
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
        (action === 'buy'
          ? Patterns.check('smallerOrEqual')(
              price,
              currentPair.maxLastPriceShow,
              <>
                <FormattedMessage id={'MaxPrice'} /> {currentPair.maxLastPriceShow}
              </>
            )
          : Patterns.check('smallerOrEqual')(
              currentPair.minLastPriceShow,
              price,
              <>
                <FormattedMessage id={'MinPrice'} /> {currentPair.minLastPriceShow}
              </>
            ));
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
        Patterns.check('smallerOrEqual')(
          amount,
          this.getMaxAmount(action, price),
          <FormattedMessage id={'AmountNotEnough'} />
        );
      this.changeBS(action, { amountErrMsg: errMsg }, callback);
      return errMsg;
    },

    confirm: action => {
      return ['checkPrice', 'checkAmount', 'checkTotal'].every(item => !this.checkAll[item](action));
    },
  };

  startInit = () => {
    const {
      model: { currentPair, setPrecision, showUnitPrecision },
    } = this.props;
    this.fetchPoll(this.getAccountAssets);
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

  getAccountAssets = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getAccountAssets',
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
      model: { currentPair, setPrecision, getPrecision, showUnitPrecision },
    } = this.props;
    const [currentCurrencyAssetFree, currentAssetsAssetFree] = this.getCurrentAssetFree();
    const unit = action === 'buy' ? currentPair.currency : currentPair.assets;
    return action === 'buy'
      ? showUnitPrecision(getPrecision(currentPair.assets), 0)(setPrecision(currentCurrencyAssetFree / price, unit))
      : setPrecision(currentAssetsAssetFree, unit);
  };

  getMaxTradePrecision = () => {
    const {
      model: { currentPair, getPrecision },
    } = this.props;
    // 交易额的精度要用资产自身的精度
    return Math.max(getPrecision(currentPair.currency), currentPair.assetsPrecision);
  };

  renderArea = ({ direction: { price, amount, action } = {}, PriceLabel, AmountLabel }) => {
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
    const actionUpper = action.charAt(0).toUpperCase() + action.slice(1);
    return (
      <div className={styles.user}>
        <div className={styles.freebalance}>
          <FormattedMessage id={'FreeBalance'} />:{' '}
          <span>
            {action === 'buy'
              ? setPrecision(currentCurrencyAssetFree, currentPair.currency) || '-'
              : setPrecision(currentAssetsAssetFree, currentPair.assets) || '-'}{' '}
            <span>{action === 'buy' ? currentPair.currency : currentPair.assets}</span>
          </span>
        </div>
        <div className={styles.userprice}>
          <div className={styles.pricelabel}>{<FormattedMessage id={`${actionUpper}Price`} />}</div>
          <div className={styles.input}>
            <Input.Text
              errMsgIsOutside
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
          <div className={styles.amountlabel}>{<FormattedMessage id={`${actionUpper}Amount`} />}</div>
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
          <FormattedMessage id={'TradingVolume'} /> {formatNumber.toFixed(price * amount, this.getMaxTradePrecision())}{' '}
          {currentPair.currency} {tradeErrMsg ? <div className={styles.tradeErrMsg}>{tradeErrMsg}</div> : null}
        </div>
        {isLogin() ? (
          <div className={styles.submit}>
            <Button
              loading={loading[loadingAction]}
              className={classNames(styles[action], loading[loadingAction] ? styles.loading : null)}
              onClick={() => {
                if (checkAll.confirm(action) && !tradeErrMsg) {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [
                        { name: 'operation', value: () => <FormattedMessage id={'PlaceOrder'} /> },
                        {
                          name: () => <FormattedMessage id={'TradingPair'} />,
                          value: `${currentPair.assets}/${currentPair.currency}`,
                        },
                        {
                          name: () => <FormattedMessage id={'Direction'} />,
                          value: () => <FormattedMessage id={action === 'buy' ? 'Buy' : 'Sell'} />,
                        },
                        {
                          name: () => <FormattedMessage id={'Offer'} />,
                          value: setBlankSpace(price, currentPair.currency),
                        },
                        {
                          name: () => <FormattedMessage id={'Amount'} />,
                          value: setBlankSpace(amount, currentPair.assets),
                        },
                        {
                          name: () => <FormattedMessage id={'Account'} />,
                          value: currentAccount.address,
                          toastShow: false,
                        },
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
                          },
                        });
                      },
                    },
                  });
                }
              }}>
              <FormattedMessage id={actionUpper} /> {currentPair.assets}
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
      PriceLabel: '买入价',
      AmountLabel: '买入量',
    };
    const sellConfig = {
      direction: sell,
      PriceLabel: '卖出价',
      AmountLabel: '卖出量',
    };
    return (
      <div className={styles.putOrder}>
        <div className={styles.header}>
          <div className={styles.title}>
            <FormattedMessage id={'LimitTrade'} />
          </div>
          <span>
            <FormattedMessage id={'MatchingFee'} />
            ：0.00%
          </span>
        </div>
        <div className={styles.operation}>
          <div className={styles.top}>
            {renderArea(buyConfig)}
            <div className={styles.seperation} />
            {renderArea(sellConfig)}
          </div>
          {!isLogin() ? (
            <div className={styles.download}>
              <span>
                <FormattedMessage id={'SetupAccount'} />
              </span>
              <ButtonGroup>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'ImportAccountModal',
                    });
                  }}>
                  <FormattedMessage id={'ImportAccount'} />
                </Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'CreateAccountModal',
                    });
                  }}>
                  <FormattedMessage id={'NewAccount'} />
                </Button>
                {/*<Button type="warn">*/}
                {/*<FormattedMessage id={'DownloadWallet'} />*/}
                {/*</Button>*/}
              </ButtonGroup>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default PutOrder;
