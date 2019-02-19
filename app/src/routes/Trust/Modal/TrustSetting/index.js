import React, { Component } from 'react';
import { Button, Modal } from '@components';

class TrustSettingModal extends Component {
  state = {
    address: '',
    isNodeOk: false,
  };

  render() {
    function importSetting() {
      console.log('import setting');
    }

    const modalButton = (
      <Button size="full" type="confirm" onClick={importSetting}>
        确定
      </Button>
    );

    return (
      <Modal title="设置信托" button={modalButton}>
        <div>hello world</div>
      </Modal>
    );
  }
}

export default TrustSettingModal;
