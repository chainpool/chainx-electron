import React from 'react';
import { Button, Input, Mixin, Modal, RadioGroup } from '../../../components';
import { InputHorizotalList } from '../../components';
import { PlaceHolder } from '../../../constants';
import { Inject, Patterns } from '../../../utils';
import * as styles from './VoteModal.less';
import { FreeBalance } from '@routes/components';

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

      const errMsg =
        Patterns.check('required')(amount) ||
        Patterns.smaller(0, amount, '投票数量必须大于0') ||
        (action === 'add'
          ? Patterns.check('smallerOrEqual')(amount, freeShow)
          : Patterns.check('smallerOrEqual')(amount, setDefaultPrecision(myTotalVote), '赎回数量不足'));
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
    const operation = `${!myTotalVote ? '投票' : action === 'add' ? '追加' : '赎回'}`;

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
                      { name: `${operation}数量`, value: amount },
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
            <RadioGroup>
              {[{ label: '追加投票', value: 'add' }, { label: '赎回投票', value: 'cancel' }].map(item => (
                <Input.Radio
                  active={action === item.value}
                  key={item.value}
                  label={item.label}
                  value={action}
                  onClick={() => this.setState({ action: item.value })}>
                  {item.value === 'cancel' ? (
                    <span className={styles.lockweek}>{`(锁定期${bondingSeconds}分钟)`}</span>
                  ) : null}
                </Input.Radio>
              ))}
            </RadioGroup>
          ) : null}

          {action === 'add' ? (
            <InputHorizotalList
              left={
                <Input.Text
                  precision={getDefaultPrecision()}
                  label={`${operation}数量`}
                  value={amount}
                  errMsg={amountErrMsg}
                  onChange={value => this.setState({ amount: value })}
                  onBlur={checkAll.checkAmount}>
                  <span>
                    修改后投票数：
                    {action === 'add'
                      ? setDefaultPrecision(myTotalVote + Number(setDefaultPrecision(amount, true)))
                      : setDefaultPrecision(myTotalVote - Number(setDefaultPrecision(amount, true)))}
                  </span>
                </Input.Text>
              }
              right={<FreeBalance value={freeShow} unit={token} />}
            />
          ) : (
            <Input.Text
              precision={getDefaultPrecision()}
              label={`${operation}数量`}
              value={amount}
              errMsg={amountErrMsg}
              onChange={value => this.setState({ amount: value })}
              onBlur={checkAll.checkAmount}>
              <span>
                修改后投票数：
                {action === 'add'
                  ? setDefaultPrecision(myTotalVote + Number(setDefaultPrecision(amount, true)))
                  : setDefaultPrecision(myTotalVote - Number(setDefaultPrecision(amount, true)))}
              </span>
            </Input.Text>
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
