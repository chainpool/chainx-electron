import React from 'react';
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
    showSlider: true,
  };

  startInit = async () => {
    const {
      globalStore: { modal: { data: { token: targetToken, callback } = {} } = {} },
    } = this.props;
    const token = targetToken || 'PCX';
    if (_.isFunction(callback)) {
      this.result = await callback({ token });
      if (this.result && this.result.extrinsic) {
        this.getFee();
      }
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
        Patterns.check('smallerOrEqual')(fee, setPrecision(free, name), '可用余额不足以支付费用') ||
        Patterns.check('required')(fee, '手续费未获取到');
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
      globalStore: { closeModal, nativeAssetName, modal: { data: { description: descriptionAlias } = {} } = {} },
      model: { currentAccount },
    } = this.props;
    const description = descriptionAlias.map(item => {
      return {
        name: _.isFunction(item.name) ? item.name() : item.name,
        value: _.isFunction(item.value) ? item.value() : item.value,
        toastShow: item.toastShow,
      };
    });

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
                  const operationItem =
                    description.filter((item = {}) => item.name === operation || item.name === 'operation')[0] || {};
                  const toastOperation = description.filter(
                    (item = {}) => item.name !== operation && item.name !== 'operation' && item.toastShow !== false
                  );
                  const toastMessage = (
                    <div className={styles.toastMessage}>
                      {toastOperation.map((item = {}, index) => (
                        <span key={index}>
                          {item.name}&nbsp;{item.value}
                          {index === toastOperation.length - 1 ? '' : <>;&nbsp;</>}
                        </span>
                      ))}
                    </div>
                  );

                  const reCoverLoading = status => {
                    _.isFunction(result.loading) && result.loading(status);
                  };

                  const success = res => {
                    reCoverLoading(false);
                    _.isFunction(result.success) && result.success(res);
                    Toast.success(
                      _.get(result, 'successToast.title') || operationItem.value || `${operation}成功`,
                      toastMessage
                    );
                  };

                  const fail = (err = {}) => {
                    reCoverLoading(false);
                    _.isFunction(result.fail) && result.fail(err);
                    _.get(err, 'data') && console.log(_.get(err, 'data'), _.get(err, 'message'));
                    Toast.warn(
                      _.get(result, 'failToast.title') || operationItem.value || `${operation}报错`,
                      _.get(err, 'data.message') || _.get(err, 'message') || _.get(err, 'data.message') || toastMessage
                    );
                  };

                  reCoverLoading(true);
                  const extrinsic = result.extrinsic;
                  closeModal();
                  _.isFunction(result.beforeSend) && result.beforeSend();
                  try {
                    const promise = () =>
                      new Promise((resolve, reject) => {
                        extrinsic.signAndSend(
                          ChainX.account.fromKeyStore(currentAccount.encoded, password),
                          { acceleration },
                          (err, res) => {
                            if (!err) {
                              if (resOk(res)) {
                                success(res);
                                resolve();
                              } else if (resFail(res)) {
                                fail(err);
                                reject();
                              }
                            } else {
                              fail(err);
                              reject();
                            }
                          }
                        );
                      });

                    Promise.race([
                      promise(),
                      new Promise((resovle, reject) => {
                        setTimeout(() => {
                          reject(new Error('timeOut'));
                        }, 7000);
                      }),
                    ]).catch(err => {
                      if (err && err.message === 'timeOut') {
                        reCoverLoading(false);
                      }
                    });
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
                  }}
                />
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
