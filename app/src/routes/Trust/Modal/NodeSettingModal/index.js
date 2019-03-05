import React, { Component } from 'react';
import { Button, Modal, Input } from '@components';
import { Patterns } from '../../../../utils';

class NodeSettingModal extends Component {
  constructor(props) {
    super(props);
    const {
      globalStore: { modal: { data: { node: node_prev } = {} } = {} },
    } = props;
    this.state = {
      node: node_prev,
      nodeErrMsg: '',
      trusteeAddress: '',
    };
  }

  componentDidMount() {
    const {
      assetStore: { dispatch },
      globalStore: { modal: { data: { chain } = {} } = {} },
    } = this.props;
    dispatch({
      type: 'getTrusteeAddress',
      payload: {
        chain,
      },
    }).then(res => {
      if (res) {
        this.setState({
          trusteeAddress: res,
        });
      }
    });
  }

  checkAll = {
    checkNode: () => {
      const { node } = this.state;
      const errMsg = Patterns.check('required')(node);
      this.setState({ nodeErrMsg: errMsg });
      return errMsg;
    },

    confirm: () => {
      return ['checkNode'].every(item => !this.checkAll[item]());
    },
  };

  render() {
    const { checkAll } = this;
    const { node, nodeErrMsg, trusteeAddress } = this.state;
    const {
      model: { dispatch, closeModal },
      globalStore: { modal: { data: { chain } = {} } = {} },
    } = this.props;

    return (
      <Modal
        title="设置节点"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              if (this.checkAll.confirm()) {
                dispatch({
                  type: 'updateTrust',
                  payload: {
                    node,
                    chain,
                    trusteeAddress: trusteeAddress ? [trusteeAddress] : '',
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
            label="节点地址"
            value={node}
            errMsg={nodeErrMsg + ''}
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

export default NodeSettingModal;
