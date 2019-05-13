import React from 'react';
import { Modal, Input, Button, Mixin, FormattedMessage } from '../../../components';
import { NetWork } from '../../../constants';
import { Patterns, _, Inject } from '../../../utils';
import * as styles from './OperationNodeModal.less';

@Inject(({ chainStore }) => ({ chainStore }))
class OperationNodeModal extends Mixin {
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
    checkAddress: async () => {
      const { address } = this.state;
      let errMsg = Patterns.check('required')(address) || Patterns.check('isWsAddress')(address);
      if (!errMsg) {
        errMsg = await this.checkAll.checkNetType(address);
      }
      this.setState({ addressErrMsg: errMsg });
      return errMsg;
    },
    checkNetType: async address => {
      const {
        model: { currentNetWork: { name, value } = {} },
        chainStore: { dispatch },
      } = this.props;
      let res = '';
      try {
        res = await dispatch({
          type: 'getChainPropertiesFetch',
          payload: { url: address },
        });
        if (!res) {
          return <FormattedMessage id={'NotGetNodeNetType'} />;
        }
      } catch (err) {
        return <FormattedMessage id={'NodeLinkFail'} />;
      }
      const desc = NetWork.filter((item = {}) => item.value === res)[0];
      return res.search(value) > -1 ? '' : `该节点网络类型(${desc.name})不允许添加到${name}网络类型`;
    },
    confirm: async () => {
      const result1 = await this.checkAll['checkName']();
      const result2 = await this.checkAll['checkAddress']();
      return !result1 && !result2;
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
        title={action === 'add' ? <FormattedMessage id={'AddNode'} /> : <FormattedMessage id={'ChangeNode'} />}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={async () => {
              if (await checkAll.confirm()) {
                _.isFunction(callback) &&
                  callback({
                    action,
                    name,
                    address,
                  });
                closeModal();
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.OperationNodeModal}>
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
            errMsgIsOutside
            placeholder="wss://abcd.com:6789"
            label={
              <div>
                <FormattedMessage id={'NodeAddress'} />
                <span className={styles.assetData}>
                  (<FormattedMessage id={'ProvideCoreAssetData'} />)
                </span>
              </div>
            }
            value={address}
            errMsg={addressErrMsg}
            onChange={value => {
              this.setState({ address: value.trim() });
            }}
            onBlur={checkAll.checkAddress}
          />
        </div>
      </Modal>
    );
  }
}

export default OperationNodeModal;
