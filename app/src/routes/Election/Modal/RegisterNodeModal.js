import React, { Component } from 'react';
import { Button, Input, Modal } from '../../../components';
import { Inject, Patterns } from '../../../utils';

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
    checkName: () => {
      const { name } = this.state;
      const errMsg =
        Patterns.check('required')(name) || Patterns.check('smallerOrEqual')(2, name.length, '最少2个字符长度');
      this.setState({ nameErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkName'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { name, nameErrMsg } = this.state;
    const {
      model: { dispatch, openModal },
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
                    callback: () => {
                      return dispatch({
                        type: 'register',
                        payload: {
                          name,
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
            placeholder="2-16个字符"
            label={
              <div>
                名称 <span style={{ color: '#ea754b', marginLeft: 3 }}> (唯一且不可更改，注册后不可转让)</span>
              </div>
            }
            value={name}
            errMsg={nameErrMsg}
            onChange={value => this.setState({ name: value.slice(0, 16) })}
            onBlur={checkAll.checkName}
          />
        </div>
      </Modal>
    );
  }
}

export default RegisterNodeModal;
