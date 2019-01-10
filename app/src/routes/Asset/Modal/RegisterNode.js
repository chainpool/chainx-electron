import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { Patterns } from '../../../utils';
import { PlaceHolder } from '@constants';

class RegisterNode extends Component {
  state = {
    address: '',
    addressErrMsg: '',
    name: '',
    nameErrMsg: '',
    website: '',
    websiteErrMsg: '',
    amount: '',
    amountErrMsg: '',
    remark: '',
  };
  checkAll = {
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkName: () => {
      const { name } = this.state;
      const errMsg = Patterns.check('required')(name) || Patterns.check('smaller')(name.length, 12, '不能超过12个字符');
      this.setState({ nameErrMsg: errMsg });
      return errMsg;
    },
    checkWebsite: () => {
      const { website } = this.state;
      const errMsg = Patterns.check('required')(website);
      this.setState({ websiteErrMsg: errMsg });
      return errMsg;
    },
    checkAmount: () => {
      const { amount } = this.state;
      const errMsg = Patterns.check('required')(amount);
      this.setState({ amountErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkAddress', 'checkName', 'checkWebsite', 'checkAmount'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const {
      address,
      addressErrMsg,
      name,
      nameErrMsg,
      website,
      websiteErrMsg,
      amount,
      amountErrMsg,
      remark,
    } = this.state;
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="注册节点"
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
        <div>
          <Input.Select
            prefix="ChainX"
            label="节点账户地址"
            value={address}
            errMsg={addressErrMsg}
            options={[{ label: 1, value: 1 }]}
            onChange={value => this.setState({ address: value })}
            onBlur={checkAll.checkAddress}
          />
          <InputHorizotalList
            left={
              <Input.Text
                placeholder="12个字符以内"
                label="名称"
                value={name}
                errMsg={nameErrMsg}
                onChange={value => this.setState({ name: value })}
                onBlur={checkAll.checkName}
              />
            }
            right={
              <Input.Text
                label="网站"
                placeholder="www.chainx.org"
                value={website}
                errMsg={websiteErrMsg}
                onChange={value => this.setState({ website: value })}
                onBlur={checkAll.checkWebsite}
              />
            }
          />
          <InputHorizotalList
            left={
              <Input.Text
                label="分配额度"
                value={amount}
                errMsg={amountErrMsg}
                onChange={value => this.setState({ amount: value })}
                onBlur={checkAll.checkAmount}
              />
            }
            right={<FreeBalance label="剩余额度" value={'40'} />}
          />
          <Input.Text
            isTextArea
            rows={4}
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

export default RegisterNode;
