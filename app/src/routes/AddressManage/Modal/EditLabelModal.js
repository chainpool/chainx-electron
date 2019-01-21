import React, { Component } from 'react';
import { Modal, Input, Button } from '../../../components';
import { Patterns } from '../../../utils';

class EditLabelModal extends Component {
  state = {
    label: '',
    labelErrMsg: '',
  };
  checkAll = {
    checkLabel: () => {
      const { label } = this.state;
      const errMsg =
        Patterns.check('required')(label) || Patterns.check('smaller')(label.length, 12, '不能超过12个字符');
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
      model: { closeModal, dispatch },
      globalStore: {
        modal: {
          data: { index },
        },
      },
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
                  type: 'updateLabel',
                  payload: {
                    index,
                    label: this.state.label,
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
            label="标签"
            placeholder="12字符以内"
            value={label}
            errMsg={labelErrMsg}
            onChange={value => this.setState({ label: value })}
            onBlur={checkAll.checkLabel}
          />
        </div>
      </Modal>
    );
  }
}

export default EditLabelModal;
