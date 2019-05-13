import React, { Component } from 'react';
import { Modal, Input, Button, FormattedMessage } from '../../../components';
import { _, Patterns } from '../../../utils';
import * as styles from './OperationApiModal.less';

class OperationApiModal extends Component {
  constructor(props) {
    super(props);
    const {
      globalStore: {
        modal: { data: { name = '', address = '' } = {} },
      },
    } = this.props;
    this.state = {
      name: name,
      nameErrMsg: '',
      address: address,
      addressErrMsg: '',
    };
  }
  checkAll = {
    checkName: () => {
      const { name } = this.state;
      const errMsg = Patterns.check('required')(name);
      this.setState({ nameErrMsg: errMsg });
      return errMsg;
    },
    checkAddress: () => {
      const { address } = this.state;
      const errMsg = Patterns.check('required')(address) || Patterns.check('isHttpAddress')(address);
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    confirm: () => {
      return ['checkName', 'checkAddress'].every(item => !this.checkAll[item]());
    },
  };
  render() {
    const { checkAll } = this;
    const { name, nameErrMsg, address, addressErrMsg } = this.state;
    const {
      model: { closeModal },
      globalStore: {
        modal: { data: { action, callback } = {} },
      },
    } = this.props;
    return (
      <Modal
        title={<FormattedMessage id={'AddApi'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (checkAll.confirm()) {
                if (checkAll.confirm()) {
                  _.isFunction(callback) &&
                    callback({
                      action,
                      name,
                      address,
                    });
                  closeModal();
                }
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.OperationApiModal}>
          <FormattedMessage id={'CharacterLength'} values={{ length: 12 }}>
            {msg => (
              <Input.Text
                placeholder={msg}
                label={<FormattedMessage id={'Name'} />}
                value={name}
                errMsg={nameErrMsg}
                onChange={value => {
                  this.setState({ name: value.slice(0, 12) });
                }}
                onBlur={checkAll.checkName}
              />
            )}
          </FormattedMessage>

          <Input.Text
            placeholder="https://api.chainx.org"
            label={
              <div>
                <FormattedMessage id={'ApiAddress'} />
                <span className={styles.listData}>
                  (<FormattedMessage id={'ProvideDetailedListData'} />)
                </span>
              </div>
            }
            value={address}
            errMsg={addressErrMsg}
            onChange={value => {
              this.setState({ address: value });
            }}
            onBlur={checkAll.checkAddress}
          />
        </div>
      </Modal>
    );
  }
}

export default OperationApiModal;
