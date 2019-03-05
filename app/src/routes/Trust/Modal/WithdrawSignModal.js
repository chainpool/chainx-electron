import React, { Component } from 'react';
import * as styles from './WithdrawSignModal.less';
import { ButtonGroup, Button, Modal, Input, Icon } from '../../../components';

class WithdrawSignModal extends Component {
  state = {
    activeIndex: 0,
  };
  render() {
    const { activeIndex } = this.state;
    const {
      accountStore: { closeModal },
    } = this.props;

    return (
      <Modal
        title="响应多签提现"
        button={
          <Button size="full" type="confirm">
            确定
          </Button>
        }>
        <div className={styles.withdrawSign}>
          <div className={styles.sign}>
            <div className={styles.desc}>待签原文：</div>
            <div>
              hdahsudhiaushdiahsidiquhdahsudhiaushdiahsidiquhdahsudhiaushdia…
              <span>
                <Icon name="icon-wancheng" className={styles.right} />
                正确
              </span>
            </div>
          </div>
          <ButtonGroup className={styles.buttonselect}>
            {['签名', '否决'].map((item, index) => (
              <Button
                type="confirm"
                key={index}
                className={activeIndex === index ? styles.active : null}
                onClick={() => {
                  this.setState({
                    activeIndex: index,
                  });
                }}>
                {item}
              </Button>
            ))}
          </ButtonGroup>
          <Input.Text isPassword placeholder="输入热私钥密码" />
        </div>
      </Modal>
    );
  }
}

export default WithdrawSignModal;
