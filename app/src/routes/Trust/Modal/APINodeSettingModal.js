import React, { Component } from 'react';
import { Button, Modal, Input, FormattedMessage } from '../../../components';
import { RegEx, Patterns } from '../../../utils';
import * as styles from './APINodeSettingModal.less';
import { InputHorizotalList } from '../../components';

class APINodeSettingModal extends Component {
  constructor(props) {
    super(props);
    const {
      globalStore: { modal: { data: { node: node_prev } = {} } = {} },
    } = props;
    this.state = {
      node: node_prev || '',
      nodeErrMsg: '',
      chain: '',
    };
  }

  updateTrust = () => {
    const { node } = this.state;
    const {
      model: { dispatch, closeModal },
      globalStore: { modal: { data: { chain } = {} } = {} },
    } = this.props;
    dispatch({
      type: 'subScribeApiNodeStatus',
      payload: {
        url: node,
      },
    })
      .then(res => {
        if (res) {
          dispatch({
            type: 'updateTrust',
            payload: {
              node,
              chain,
            },
          });
          closeModal();
        }
      })
      .catch(() =>
        this.setState({
          nodeErrMsg: '节点连接失败',
        })
      );
  };

  checkAll = {
    checkNode: () => {
      const { node } = this.state;
      const errMsg =
        Patterns.check('required')(node) ||
        (RegEx.checkAuthorizationHttps.test(node) ? '' : <FormattedMessage id={'NotMathTheFormat'} />);
      this.setState({ nodeErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkNode'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { node, nodeErrMsg } = this.state;
    const {
      globalStore: {
        assets = [],
        modal: { data: { chain } = {} },
      },
    } = this.props;

    const options = assets
      .map(asset => ({ label: asset.chain, value: asset.name }))
      .filter(item => item.label === chain);

    return (
      <Modal
        title={'设置跨链节点'}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (this.checkAll.confirm()) {
                this.updateTrust();
              }
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.APINodeSettingModal}>
          <InputHorizotalList
            left={
              <Input.Select
                allowCreate={false}
                label={<FormattedMessage id={'ChooseChain'} />}
                value={options[0]}
                options={options}
                onChange={value => {
                  this.setState({ chain: value });
                }}
                onBlur={checkAll.checkChain}
              />
            }
            right=""
          />
          <Input.Text
            errMsgIsOutside
            label={
              <div className={styles.nodeexample}>
                <FormattedMessage id={'NodeAddress'} />
                <span>
                  <FormattedMessage id={'Example'} />: name:password@hostname.org (强制https)
                </span>
              </div>
            }
            value={node}
            placeholder={`API接口: name:password@hostname/[?path]`}
            errMsg={nodeErrMsg}
            onChange={value => {
              this.setState({ node: value });
            }}
            onBlur={checkAll.checkNode}
          />
        </div>
      </Modal>
    );
  }
}

export default APINodeSettingModal;
