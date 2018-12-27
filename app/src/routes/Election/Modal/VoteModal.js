import React, { Component } from 'react';
import { Modal, Input, Button, RadioGroup } from '../../../components';
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
      const errMsg = Patterns.check('required')(amount);
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },
    checkRemark: () => {
      const { remark } = this.state;
      const errMsg = Patterns.check('smaller')(remark.length, 128, '不能超过128个字符');
      this.setState({ remarkErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAmount', 'checkRemark'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { amount, amountErrMsg, remark, remarkErrMsg, action } = this.state;
    const {
      model: { closeModal },
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
                closeModal();
              }
            }}>
            确定
          </Button>
        }>
        <div className={styles.voteModal}>
          {action === 'vote' ? null : (
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
            label={`${action === 'vote' ? '投票' : action === 'add' ? '追加' : '赎回'}数量`}
            value={amount}
            errMsg={amountErrMsg}
            onChange={value => this.setState({ amount: value })}
            onBlur={checkAll.checkAmount}>
            <span>修改后投票数：3000</span>
          </Input.Text>
          <Input.Text
            isTextArea
            rows={4}
            label="备注"
            placeholder="128个字符"
            value={remark}
            errMsg={remarkErrMsg}
            onChange={value => this.setState({ remark: value })}
            onBlur={checkAll.checkRemark}
          />
        </div>
      </Modal>
    );
  }
}

export default VoteModal;
