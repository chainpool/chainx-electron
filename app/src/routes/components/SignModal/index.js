import React from 'react';
import { _, ChainX, Inject, Patterns, resFail, resOk } from '../../../utils';
import { Modal, Button, Input, Mixin, Slider, Toast, FormattedMessage } from '../../../components';

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

  checkAll = {
    checkFee: () => {
      const { fee } = this.state;
      const errMsg = Patterns.check('required')(fee, '手续费未获取到');
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    checkPassword: () => {
      const { password } = this.state;
      const {
        model: { currentAccount: { encoded } = {} },
      } = this.props;
      const errMsg = Patterns.check('required')(password) || Patterns.check('decode')(encoded, password);
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    checkNativeAssetEnough: () => {
      const { fee } = this.state;
      const {
        assetStore: { accountNativeAssetFreeBalanceShow },
        globalStore: {
          modal: {
            data: { checkNativeAsset },
          },
        },
      } = this.props;

      const errMsg =
        _.isFunction(checkNativeAsset) && checkNativeAsset(accountNativeAssetFreeBalanceShow, fee, 0)
          ? ''
          : 'PCX余额不足以支付费用';
      this.setState({ passwordErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkFee', 'checkNativeAssetEnough', 'checkPassword'].every(item => !this.checkAll[item]());
    },
  };

  startInit = async () => {
    const {
      globalStore: { modal: { data: { token: targetToken, callback } = {} } = {} },
    } = this.props;
    const token = targetToken || 'PCX';
    if (_.isFunction(callback)) {
      this.result = await callback({ token });
      this.getFee();
    } else {
      console.error('callback不是函数');
    }
  };

  getFee = async () => {
    const { acceleration } = this.state;
    const {
      model: { setDefaultPrecision, currentAccount },
    } = this.props;
    if (this.result && this.result.extrinsic) {
      const fee = await this.result.extrinsic.getFee(currentAccount.address, { acceleration });
      const result = setDefaultPrecision(fee);
      this.setState(
        {
          fee: result,
        },
        () => {
          this.checkAll.checkNativeAssetEnough();
        }
      );
      return result;
    }
  };

  render() {
    const { checkAll } = this;
    const { defaultAcceleration, acceleration, fee, password, passwordErrMsg, showSlider } = this.state;
    const {
      globalStore: {
        closeModal,
        nativeAssetName,
        modal: { data: { description: descriptionAlias, checkNativeAsset } = {} } = {},
      },
      assetStore: { accountNativeAssetFreeBalanceShow },
      model: { currentAccount, openModal },
    } = this.props;
    const description = descriptionAlias.map(item => {
      return {
        name: _.isFunction(item.name) ? (
          item.name()
        ) : item.name === 'operation' ? (
          <FormattedMessage id={'Operation'} />
        ) : (
          item.name
        ),
        value: _.isFunction(item.value) ? item.value() : item.value,
        toastShow: item.toastShow,
        willFilter: item.name === 'operation',
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
        title={<FormattedMessage id={'TransactionSignature'} />}
        button={
          <Button
            size="full"
            type={fee !== undefined && fee !== null ? 'confirm' : 'disabeld'}
            onClick={() => {
              if (checkAll.confirm()) {
                const sign = () => {
                  if (this.result && this.result.extrinsic) {
                    const result = this.result;
                    const operationItem = description.filter((item = {}) => item.willFilter)[0] || {};
                    const toastOperation = description.filter(
                      (item = {}) => !item.willFilter && item.toastShow !== false
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
                        _.get(err, 'data.message') ||
                          _.get(err, 'message') ||
                          _.get(err, 'data.message') ||
                          toastMessage
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
                };
                if (!checkNativeAsset(accountNativeAssetFreeBalanceShow, fee, 0.001)) {
                  openModal({
                    name: 'LowerPCXWarn',
                    data: {
                      callback: sign,
                      title: 'PCX余额过低预警',
                    },
                  });
                } else {
                  sign();
                }
              }
            }}>
            <FormattedMessage id={'Sign'} />
          </Button>
        }>
        <div className={styles.signModal}>
          <div className={styles.descList}>
            <table>
              <tbody>
                {description.map((item = {}, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.fee}>
            <span>
              <FormattedMessage id={'NodeFee'} />
            </span>
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
              <span className={styles.feedesc}>
                <FormattedMessage id={'higherFeeFasterPacked'} />
              </span>
            </div>
          ) : null}
          <FormattedMessage id={'InputPassword'}>
            {msg => (
              <Input.Text
                errMsgIsOutside
                isPassword
                placeholder={msg}
                label=""
                value={password}
                errMsg={passwordErrMsg}
                onChange={value => {
                  this.setState({ password: value });
                }}
                onBlur={checkAll.confirm}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}

export default SignModal;
