import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input } from '../../../components';
import * as styles from './TrezorPasswordModal.less';
import { Patterns, _ } from '../../../utils';
import cancel from '../../../resource/cancel.png';

class TrezorPasswordModal extends Component {
  state = {
    userInput: '',
    userInputErrMsg: '',
  };
  checkAll = {
    checkUserInput: () => {
      const { userInput } = this.state;
      const errMsg = Patterns.check('required')(userInput);
      this.setState({ userInputErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkUserInput'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { userInput, userInputErrMsg } = this.state;
    const {
      globalStore: {
        modal: {
          data: { callback },
        },
      },
    } = this.props;
    return (
      <Modal
        style={{ width: 360 }}
        title={<div>签名</div>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (this.checkAll.confirm()) {
                _.isFunction && callback(userInput);
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.TrezorPasswordModal}>
          <Input.Text
            className={styles.userInput}
            errMsg={userInputErrMsg}
            value={userInput}
            isPassword
            icon={
              <img
                src={cancel}
                width={34}
                height={18}
                onClick={() => {
                  this.setState({
                    userInput: userInput.slice(0, userInput.length - 1),
                    userInputErrMsg: '',
                  });
                }}
              />
            }
            type={'password'}
            onChange={value => {
              this.setState({
                userInput: value,
                userInputErrMsg: '',
              });
            }}
            onBlur={this.checkAll.checkUserInput}
          />
          <ul>
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(item => (
              <li
                key={item}
                onClick={() => {
                  this.setState({
                    userInput: userInput + item,
                  });
                }}>
                <div />
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    );
  }
}

export default TrezorPasswordModal;
