import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input } from '../../../components';
import * as styles from './TrezorPasswordModal.less';
import { Patterns } from '../../../utils';

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
    return (
      <Modal
        style={{ width: 360 }}
        title={<div>签名</div>}
        button={
          <Button size="full" type="confirm" onClick={() => {}}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.TrezorPasswordModal}>
          <Input.Text
            className={styles.userInput}
            errMsg={userInputErrMsg}
            value={userInput}
            isPassword
            suffix={null}
            type={'password'}
            onChange={value => {
              this.setState({
                userInput: value,
              });
            }}
            onBlur={this.checkAll.checkUserInput}
          />
          <ul>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Modal>
    );
  }
}

export default TrezorPasswordModal;
