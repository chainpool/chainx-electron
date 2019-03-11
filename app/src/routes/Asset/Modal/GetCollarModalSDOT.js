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
          参与过Polkadot第一期投资的ETH地址可以直接领取SDOT。
          当前测试网期间其余人可以通过给0x000000000000000000000000000000000000abcd发起一笔金额为0的交易来标记自己，下次测试网启动时，将可以获得测试资格，领取5个SDOT，这些新增的测试数据不会保留至主网线上。
        </div>
      </Modal>
    );
  }
}

export default GetCollarModalSDOT;
