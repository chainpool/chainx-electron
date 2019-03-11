import React, { Component } from 'react';
import { _, ChainX, Inject, Patterns, resFail, resOk } from '../../../utils';
import { Modal, Button, Input, Mixin, Slider, Toast } from '../../../components';
import { PlaceHolder } from '../../../constants';

import * as styles from './index.less';

const operation = '操作';

@Inject(({ accountStore: model, assetStore }) => ({ model, assetStore }))
class SignModal extends Mixin {
  state = {
    defaultAcceleration: 1,
    acceleration: 1,
    fee: '',
    password: '',
    passwordErrMsg: '',
    showSlider: false,
  };

  startInit = async () => {
    const {
      globalStore: { modal: { data: { token: targetToken, callback } = {} } = {} },
    } = this.props;
    const token = targetToken || 'PCX';
    if (_.isFunction(callback)) {
      this.result = await callback({ token });
      this.getFee();
    }
  };

  getFee = async () => {
    const { acceleration } = this.state;
    const {
      model: { setDefaultPrecision, currentAccount },
    } = this.props;
    const fee = await this.result.extrinsic.getFee(currentAccount.address, { acceleration });
    const result = setDefaultPrecision(fee);
    this.setState({
      fee: result,
    });
    return result;
  };

  checkAll = {
    checkPassword: async () => {
      const { password } = this.state;
      const fee = await this.getFee();
      const {
        model: { currentAccount: { encoded } = {}, setPrecision },
        assetStore: { nativeAccountAssets = [] },
      } = this.props;
      const { free = 0, name } = nativeAccountAssets[0] || {};
      const errMsg =
        Patterns.check('required')(password) ||
        Patterns.check('decode')(encoded, password) ||
        Patterns.check('smallerOrEqual')(fee, setPrecision(free, name), '可用余额不足以支付费用');
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },

    confirm: async () => {
      const result = await this.checkAll.checkPassword();
      return !result;
    },
  };
  render() {
    const { checkAll } = this;
    const { defaultAcceleration, acceleration, fee, password, passwordErrMsg, showSlider } = this.state;
    const {
      globalStore: {
        closeModal,
        nativeAssetName,
        modal: {
          data: {
            description = [
              { name: operation, value: '挂单' },
              { name: '交易对', value: 'PCX /BTC' },
              { name: '方向', value: '买入' },
              { name: '报价', value: '0.00032424' },
              { name: '账户', value: '5DeCxFFfGv5eR7JNDasJa6K2fiPuCVP8W2fiPuCVP8W' },
            ],
          } = {},
        } = {},
      },
      model: { currentAccount },
    } = this.props;

    const max = 10;

    const marks = {
      [defaultAcceleration]: 'x1',
      [acceleration]: `x${acceleration}`,
      [max]: 'x10',
    };
    const sliderProps = {
      value: acceleration,
      onChange: value => {
        this.changeState(
          {
            acceleration: value,
          },
          () => {
            this.getFee();
            checkAll.checkPassword();
          }
        );
      },
      marks: marks,
      min: +defaultAcceleration,
      max: +max,
      defaultValue: defaultAcceleration,
      step: 1,
    };

    return (
      <Modal
        title="交易签名"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={async () => {
              if (await checkAll.confirm()) {
                if (this.result) {
                  const result = this.result;
                  const {
                    globalStore: { modal: { data: { description = [] } = {} } = {} },
                  } = this.props;
                  const operationItem = description.filter((item = {}) => item.name === operation)[0] || {};

                  const reCoverLoading = status => {
                    _.isFunction(result.loading) && result.loading(status);
                  };

                  const success = res => {
                    reCoverLoading(false);
                    _.isFunction(result.success) && result.success(res);
                    Toast.success(
                      `${_.get(result, 'successToast.title') || operationItem.value || operation}已完成`,
                      _.get(result, 'successToast.message')
                    );
                  };

                  const fail = (err = {}) => {
                    reCoverLoading(false);
                    _.isFunction(result.fail) && result.fail(err);
                    Toast.warn(
                      `${_.get(result, 'failToast.title') || operationItem.value || operation}报错`,
                      _.get(result, 'failToast.message') || _.get(err, 'message')
                    );
                  };

                  reCoverLoading(true);
                  const extrinsic = result.extrinsic;
                  closeModal();
                  _.isFunction(result.beforeSend) && result.beforeSend();
                  try {
                    extrinsic.signAndSend(
                      ChainX.account.fromKeyStore(currentAccount.encoded, password),
                      { acceleration },
                      (err, res) => {
                        if (!err) {
                          if (resOk(res)) {
                            success(res);
                          } else if (resFail(res)) {
                            fail(err);
                          }
                        } else {
                          fail(err);
                        }
                        if (resOk(res) || resFail(res)) {
                          _.isFunction(result.loading) && result.loading(false);
                        }
                      }
                    );
                  } catch (err) {
                    fail(err);
                  }
                }
              }
            }}>
            签名
          </Button>
        }>
        <div className={styles.signModal}>
          <ul>
            {description.map((item = {}, index) => (
              <li key={index}>
                <span>{item.name}</span>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
          <div className={styles.fee}>
            <span>节点费用</span>
            <div className={styles.speed}>
              <div>
                {fee} {nativeAssetName}
                <span
                  onClick={() => {
                    this.setState({
                      showSlider: !showSlider,
                    });
                  }}>
                  <svg
                    height="20"
                    width="20"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    focusable="false"
                    className="css-19bqh2r">
                    <path
                      d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
                      fill="#7B7F82"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          {showSlider ? (
            <div className={styles.slider}>
              <Slider {...sliderProps} style={{ width: 252 }} />
              <span className={styles.feedesc}>费用越高打包速度越快</span>
            </div>
          ) : null}

          <Input.Text
            errMsgIsOutside
            isPassword
            placeholder={PlaceHolder.password}
            label=""
            value={password}
            errMsg={passwordErrMsg}
            onChange={value => {
              this.setState({ password: value });
            }}
            onBlur={checkAll.checkPassword}
          />
        </div>
      </Modal>
    );
  }
}

export default SignModal;
