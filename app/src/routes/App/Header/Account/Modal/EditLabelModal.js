import React, { Component } from 'react';
import { Modal, Input, Button, FormattedMessage } from '../../../../../components';
import { Patterns } from '../../../../../utils';

class EditLabelModal extends Component {
  state = {
    label: '',
    labelErrMsg: '',
  };
  checkAll = {
    checkLabel: () => {
      const { label } = this.state;
      const errMsg = Patterns.check('required')(label);
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
        title={<FormattedMessage id={'ModifyLabel'} />}
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
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div>
          <FormattedMessage id={'CharacterLength'} values={{ length: 12 }}>
            {msg => (
              <Input.Text
                placeholder={msg}
                label={<FormattedMessage id={'Label'} />}
                value={label}
                errMsg={labelErrMsg}
                onChange={value => {
                  this.setState({ label: value.slice(0, 12) });
                }}
                onBlur={checkAll.checkLabel}
              />
            )}
          </FormattedMessage>
        </div>
      </Modal>
    );
  }
}

export default EditLabelModal;
