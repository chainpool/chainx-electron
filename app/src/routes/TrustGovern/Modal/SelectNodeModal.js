import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input } from '../../../components';
import * as styles from './ProposalSelectModal.less';
import { Inject } from '../../../utils';

@Inject(({ electionStore }) => ({ electionStore }))
class SelectNodeModal extends Component {
  state = {
    selectNode: '',
    selectNodeErrMsg: '',
  };

  render() {
    const { selectNode, selectNodeErrMsg } = this.state;
    const {
      electionStore: { originIntentions = [] },
      model: { openModal, dispatch, encodeAddressAccountId },
    } = this.props;

    const nodesOptions = originIntentions.map((item = {}) => ({
      label: item.name,
      value: item.account,
      isActive: item.isActive,
    }));

    return (
      <Modal
        scroll={false}
        title={<div>选择换届节点</div>}
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              const addrs = selectNode.map(item => encodeAddressAccountId(item.value));
              dispatch({
                type: 'getMockBitcoinNewTrustees',
                payload: {
                  addrs,
                },
              })
                .then(res => {
                  console.log(res, '---res');
                  if (res) {
                    openModal({
                      name: 'TrusteeSwitchModal',
                      data: {
                        addrs,
                        mockResult: res,
                      },
                    });
                  } else {
                    this.setState({
                      selectNodeErrMsg: '模拟生成错误，请检查所选节点',
                    });
                  }
                })
                .catch(() =>
                  this.setState({
                    selectNodeErrMsg: '模拟生成错误，请检查所选节点',
                  })
                );
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.ProposalSelectModal}>
          <Input.Select
            errMsgIsOutside
            errMsg={selectNodeErrMsg}
            multi={true}
            allowCreate={false}
            value={selectNode}
            placeholder={'选择节点'}
            options={nodesOptions}
            onChange={value => {
              this.setState({
                selectNode: value,
                selectNodeErrMsg: '',
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default SelectNodeModal;
