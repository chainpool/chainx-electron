import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { InputHorizotalList, FreeBalance } from '../../components';
import { Inject, Patterns, RegEx } from '../../../utils';
import { PlaceHolder } from '@constants';

@Inject(({ accountStore }) => ({ accountStore }))
class RegisterNodeModal extends Component {
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
      const errMsg = Patterns.check('required')(website) || Patterns.check('characterLength')(website, 4, 12);
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
      return ['checkName'].every(item => !this.checkAll[item]());
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
      model: { dispatch, openModal },
      accountStore: { accounts },
      globalStore: {
        modal: { data: { certName, remainingShares } = {} },
      },
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
                openModal({
                  name: 'SignModal',
                  data: {
                    description: [{ name: '操作', value: '注册节点' }, { name: '名称', value: name }],
                    callback: ({ signer, acceleration }) => {
                      dispatch({
                        type: 'register',
                        payload: {
                          signer,
                          //intention: address.address,
                          acceleration,
                          // certName,
                          name,
                          // url: website,
                          // shareCount: amount,
                          // remark,
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
        <div>
          <Input.Text
            placeholder="12个字符以内"
            label={
              <div>
                名称 <span style={{ color: '#ea754b', marginLeft: 3 }}> (唯一且不可更改，注册后不可转让)</span>
              </div>
            }
            value={name}
            errMsg={nameErrMsg}
            onChange={value => this.setState({ name: value })}
            onBlur={checkAll.checkName}
          />
        </div>
      </Modal>
    );
  }
}

export default RegisterNodeModal;
