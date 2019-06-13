import React, { Component } from 'react';
import { Button, FormattedMessage, Modal } from '../../../components';
import * as styles from './LinkWithSelectedModal.less';

class LinkWithSelectedModal extends Component {
  render() {
    const {
      model: { dispatch, openModal, closeModal },
    } = this.props;

    return (
      <Modal
        title={'签名'}
        button={
          <Button size="full" type="confirm" onClick={() => {}}>
            <FormattedMessage id={'Confirm'} />
          </Button>
        }>
        <div className={styles.LinkWithSelectedModal}>hahahahhahahaah</div>
      </Modal>
    );
  }
}

export default LinkWithSelectedModal;
