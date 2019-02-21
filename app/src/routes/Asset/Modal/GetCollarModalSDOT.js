import React, { Component } from 'react';
import { Button, Modal } from '../../../components';
import * as styles from './GetCollarModalSDOT.less';

class GetCollarModalSDOT extends Component {
  render() {
    const {
      model: { closeModal },
    } = this.props;
    return (
      <Modal
        title="领币"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              closeModal();
            }}>
            确定
          </Button>
        }>
        <div className={styles.GetCollarModalSDOT}>
          ChainX测试网中，使用任意以太坊主网地址或Kovan测试网地址，进行跨链绑定，均可领取5个SDOT。
        </div>
      </Modal>
    );
  }
}

export default GetCollarModalSDOT;
