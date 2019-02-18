import React, { Component } from 'react';
import { Button, Modal, Input } from '@components';
import * as styles from './index.less';

class NodeSettingModal extends Component {
  state = {
    address: '',
    isNodeOk: false,
  };

  render() {
    const { address, isNodeOk } = this.state;

    function importSetting() {
      console.log('import setting');
    }

    const modalButton = (
      <Button size="full" type="confirm" onClick={importSetting}>
        确定
      </Button>
    );

    return (
      <Modal title="设置节点" button={modalButton}>
        <div className={styles.setting}>
          <Input.Text
            label="节点地址"
            value={address}
            onChange={value => {
              this.setState({ address: value });
            }}
          />
          {address ? <p>{isNodeOk ? '节点正常' : '节点异常'}</p> : null}
        </div>
      </Modal>
    );
  }
}

export default NodeSettingModal;
