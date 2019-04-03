import React, { Component } from 'react';
import { Button, Modal, Input } from '../../../components';
import { RegEx, Patterns } from '../../../utils';

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
        this.setState(
          {
            trusteeAddress: res,
          },
          this.updateTrust
        );
      }
    });
  }

  updateTrust = () => {
    const { node, trusteeAddress } = this.state;
    const {
      model: { dispatch },
      globalStore: { modal: { data: { chain } = {} } = {} },
    } = this.props;
    dispatch({
      type: 'updateTrust',
      payload: {
        node,
        chain,
        trusteeAddress: trusteeAddress ? [trusteeAddress] : [],
      },
    });
  };

  checkAll = {
    checkNode: () => {
      const { node } = this.state;
      const errMsg = Patterns.check('required')(node) || (RegEx.checkIsIP.test(node) ? '' : '不符合格式');
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
      model: { closeModal },
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
                this.updateTrust();
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
            placeholder="例 127.1.1.1:8000"
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

export default NodeSettingModal;
