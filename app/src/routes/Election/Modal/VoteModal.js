import React, { Component } from 'react';
import { Modal, Input, Button, RadioGroup } from '../../../components';
import { PlaceHolder } from '../../../constants';
import { Patterns } from '../../../utils';
import * as styles from './VoteModal.less';

class VoteModal extends Component {
  state = {
    action: 'add',
    amount: '',
    amountErrMsg: '',
    remark: '',
    remarkErrMsg: '',
  };
  checkAll = {
    checkAmount: () => {
      const { amount } = this.state;
      const {
        globalStore: {
          modal: { data: { nomination = 0 } = {} },
        },
      } = this.props;
      const errMsg = Patterns.check('required')(amount);
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
      model: { dispatch, openModal },
      globalStore: {
        modal: { data: { target, nomination = 0 } = {} },
      },
    } = this.props;

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
                    description: [{ name: '操作', value: '投票' }, { name: '备注', value: remark }],
                    callback: ({ signer, acceleration }) => {
                      dispatch({
                        type: action !== 'add' ? 'unnominate' : 'nominate',
                        payload: {
                          signer,
                          acceleration,
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
          {!nomination ? null : (
            <RadioGroup>
              {[{ label: '追加投票', value: 'add' }, { label: '赎回投票', value: 'cancel' }].map(item => (
                <Input.Radio
                  active={action === item.value}
                  key={item.value}
                  label={item.label}
                  value={action}
                  onClick={() => this.setState({ action: item.value })}>
                  {item.value === 'cancel' ? <span className={styles.lockweek}>(锁定期一周)</span> : null}
                </Input.Radio>
              ))}
            </RadioGroup>
          )}

          <Input.Text
            label={`${!nomination ? '投票' : action === 'add' ? '追加' : '赎回'}数量`}
            value={amount}
            errMsg={amountErrMsg}
            onChange={value => this.setState({ amount: value })}
            onBlur={checkAll.checkAmount}>
            <span>修改后投票数：{action === 'add' ? nomination + Number(amount) : nomination - Number(amount)}</span>
          </Input.Text>
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
