import React from 'react';
import { Button, Input, Mixin, Modal, RadioGroup } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { PlaceHolder } from '../../../constants';
import { Inject, Patterns, setBlankSpace } from '../../../utils';
import * as styles from './VoteModal.less';

@Inject(({ electionStore: model, chainStore, assetStore }) => ({ model, chainStore, assetStore }))
class VoteModal extends Mixin {
  state = {
    action: 'add',
    amount: '',
    amountErrMsg: '',
    remark: '',
    remarkErrMsg: '',
  };

  startInit = async () => {
    const {
      chainStore: { dispatch },
      electionStore: { dispatch: electionDispatch },
    } = this.props;

    dispatch({ type: 'getBlockPeriod' });
    electionDispatch({ type: 'getBondingDuration' });
    electionDispatch({ type: 'getIntentionBondingDuration' });
  };

  checkAll = {
    checkAmount: () => {
      const { amount, action } = this.state;
      const {
        assetStore: { normalizedAccountNativeAssetFreeBalance: freeShow },
        globalStore: {
          setDefaultPrecision,
          modal: { data: { myTotalVote = 0 } = {} },
        },
      } = this.props;

      let errMsg = Patterns.check('required')(amount) || Patterns.smaller(0, amount, '投票数量必须大于0');

      if (!errMsg) {
        if (action === 'add') {
          errMsg = Patterns.check('smallerOrEqual')(amount, freeShow);
        } else if (action === 'cancel') {
          errMsg = Patterns.check('smallerOrEqual')(amount, setDefaultPrecision(myTotalVote), '赎回数量不足');
        }
      }
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAmount'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { amount, amountErrMsg, remark, action } = this.state;
    const {
      model: { dispatch, openModal, setDefaultPrecision, getDefaultPrecision },
      globalStore: {
        modal: { data: { target, myTotalVote = 0, isCurrentAccount } = {} },
        nativeAssetName: token,
      },
      chainStore: { blockDuration },
      electionStore: { bondingDuration, intentionBondingDuration },
      assetStore: { normalizedAccountNativeAssetFreeBalance: freeShow },
    } = this.props;

    const bondingSeconds =
      (blockDuration * (isCurrentAccount ? intentionBondingDuration : bondingDuration)) / (1000 * 60);
    const operation = `${!myTotalVote ? '投票' : action === 'add' ? '追加' : action === 'cancel' ? '赎回' : ''}`;

    return (
      <Modal
        title="投票"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [
                      { name: '操作', value: operation },
                      { name: `${operation}数量`, value: setBlankSpace(amount, token) },
                      { name: '备注', value: remark },
                    ],
                    callback: () => {
                      return dispatch({
                        type: action !== 'add' ? 'unnominate' : 'nominate',
                        payload: {
                          target,
                          amount,
                          remark,
                        },
                      });
                    },
                  },
                });
              }
            }}>
            确定
          </Button>
        }>
        <div className={styles.voteModal}>
          {myTotalVote ? (
            <>
              <ul className={styles.changeVote}>
                {[{ label: '追加投票', value: 'add' }, { label: '赎回投票', value: 'cancel' }].map((item, index) => (
                  <li
                    key={index}
                    className={action === item.value ? styles.active : null}
                    onClick={() => this.setState({ action: item.value })}>
                    {item.label}
                    {item.value === 'cancel' && (
                      <span className={styles.lockweek}>{`(锁定期${bondingSeconds}分钟)`}</span>
                    )}
                  </li>
                ))}
              </ul>

              <div className={styles.afterchange}>
                修改后投票数：
                {action === 'add' && setDefaultPrecision(myTotalVote + Number(setDefaultPrecision(amount, true)))}
                {action === 'cancel' && setDefaultPrecision(myTotalVote - Number(setDefaultPrecision(amount, true)))}
              </div>
            </>
          ) : null}

          {action === 'add' && (
            <InputHorizotalList
              left={
                <Input.Text
                  precision={getDefaultPrecision()}
                  label={`${operation}数量`}
                  value={amount}
                  errMsg={amountErrMsg}
                  onChange={value => this.setState({ amount: value })}
                  onBlur={checkAll.checkAmount}
                />
              }
              right={<FreeBalance value={freeShow} unit={token} />}
            />
          )}
          {action === 'cancel' && (
            <Input.Text
              precision={getDefaultPrecision()}
              label={`${operation}数量`}
              value={amount}
              errMsg={amountErrMsg}
              onChange={value => this.setState({ amount: value })}
              onBlur={checkAll.checkAmount}
            />
          )}

          <Input.Text
            isTextArea
            rows={1}
            label="备注"
            placeholder={PlaceHolder.setTextAreaLength}
            value={remark}
            onChange={value => this.setState({ remark: value.slice(0, PlaceHolder.getTextAreaLength) })}
          />
        </div>
      </Modal>
    );
  }
}

export default VoteModal;
