import React, { Component } from 'react';
import * as styles from './WithdrawSignModal.less';
import { ButtonGroup, Button, Modal, Input, Icon } from '../../../components';

class WithdrawSignModal extends Component {
  state = {
    activeIndex: 0,
    tx: '',
    signStatus: true,
    redeemScript: '',
  };

  componentDidMount() {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'getWithdrawTx',
    }).then(res => {
      if (res) {
        const { tx, signStatus, redeemScript } = res;
        this.setState({
          tx,
          signStatus,
          redeemScript,
        });
      }
    });
  }
  render() {
    const { activeIndex, tx, redeemScript } = this.state;
    const {
      model: { openModal, dispatch },
    } = this.props;

    return (
      <Modal
        title="响应多签提现"
        button={
          <Button
            size="full"
            type="confirm"
            onClick={() => {
              openModal({
                name: 'SignModal',
                data: {
                  description: [{ name: '操作', value: '响应多签提现' }],
                  callback: () => {
                    return dispatch({
                      type: 'signWithdrawTx',
                      payload: {
                        voteState: !activeIndex,
                        tx,
                        redeemScript,
                      },
                    });
                  },
                },
              });
            }}>
            确定
          </Button>
        }>
        <div className={styles.withdrawSign}>
          <div className={styles.sign}>
            <div className={styles.desc}>待签原文：</div>
            <div className={styles.tx}>
              <span>
                {tx}
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
