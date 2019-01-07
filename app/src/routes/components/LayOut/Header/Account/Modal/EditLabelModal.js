import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../../../../components';
import { Patterns } from '../../../../../../utils';

class EditLabelModal extends Component {
  state = {
    label: '',
    labelErrMsg: '',
  };
  checkAll = {
    checkLabel: () => {
      const { label } = this.state;
      const errMsg = Patterns.check('required')(label) || Patterns.check('smaller')(label.length, 12, '12字符以内');
      this.setState({ labelErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkLabel'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { label, labelErrMsg } = this.state;
    const {
      model: { dispatch, closeModal },
      globalStore: { modal: { data: { address } = {} } = {} },
    } = this.props;
    return (
      <Modal
        title="修改标签"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                dispatch({
                  type: 'updateTag',
                  payload: {
                    address,
                    tag: label,
                  },
                });
                closeModal();
              }
            }}>
            确定
          </Button>
        }>
        <div>
          <Input.Text
            placeholder="12字符以内"
            label="标签"
            value={label}
            errMsg={labelErrMsg}
            onChange={value => {
              this.setState({ label: value });
            }}
            onBlur={checkAll.checkLabel}
          />
        </div>
      </Modal>
    );
  }
}

export default EditLabelModal;
