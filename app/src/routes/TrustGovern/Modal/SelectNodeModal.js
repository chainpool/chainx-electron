import React, { Component } from 'react';
import { Button, FormattedMessage, Modal, Input } from '../../../components';
import * as styles from './ProposalSelectModal.less';
import { Inject } from '../../../utils';

@Inject(({ electionStore }) => ({ electionStore }))
class SelectNodeModal extends Component {
  state = {
    selectNode: '',
  };

  render() {
    const { selectNode } = this.state;
    const {
      electionStore: { originIntentions = [] },
      model: { openModal },
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
              openModal({
                name: 'TrusteeSwitchModal',
              });
            }}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.ProposalSelectModal}>
          <Input.Select
            multi={true}
            allowCreate={false}
            value={selectNode}
            placeholder={'选择节点'}
            options={nodesOptions}
            onChange={value => {
              this.setState({
                selectNode: value,
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default SelectNodeModal;
