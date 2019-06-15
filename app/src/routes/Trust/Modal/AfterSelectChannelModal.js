import React, { Component } from 'react';
import { Modal, Button, FormattedMessage } from '../../../components';
import * as styles from './AfterSelectChannelModal.less';

class AfterSelectChannelModal extends Component {
  state = {
    loading: false,
    linkStatus: false,
    signErrMsg: '',
    signResult: '',
  };

  signWithHardware = async () => {
    const {
      model: { dispatch },
      globalStore: {
        modal: {
          data: { desc },
        },
      },
    } = this.props;
    this.setState({
      loading: true,
      signErrMsg: `请查看${desc}硬件确认`,
    });
    const res = await dispatch({
      type: 'signWithHardware',
    }).catch(err => {
      this.setState({
        signErrMsg: err.message,
        loading: false,
      });
    });

    if (res) {
      this.setState({
        signResult: res,
        linkStatus: true,
        loading: false,
      });
      return res;
    }
  };

  render() {
    const { linkStatus, signErrMsg, loading } = this.state;
    const {
      globalStore: {
        modal: {
          data: { desc, tx },
        },
      },
      model: { openModal },
    } = this.props;

    return (
      <Modal
        title={`签名（${desc}）`}
        button={
          <>
            {signErrMsg && <div className={styles.errmsg}>{signErrMsg}</div>}
            <Button
              loading={loading}
              size="full"
              type="confirm"
              onClick={() => {
                this.signWithHardware().then(res => {
                  if (res) {
                    openModal({
                      name: 'SignResultModal',
                      data: {
                        desc,
                        signResult: res,
                      },
                    });
                  }
                });
              }}>
              <FormattedMessage id={'Confirm'} />
            </Button>
          </>
        }>
        <div className={styles.AfterSelectChannelModal}>
          <ul>
            <li>
              <span>状态：</span>
              <span>{linkStatus ? '已连接' : '未连接'}</span>
            </li>
          </ul>
          <div className={styles.secret}>
            <div className={styles.label}>待签原文：</div>
            <div className={styles.result}>{tx}</div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default AfterSelectChannelModal;
