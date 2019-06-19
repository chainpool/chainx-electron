import React, { Component } from 'react';
import { Modal, Button, FormattedMessage, Input } from '../../../components';
import * as styles from './AfterSelectChannelModal.less';

class AfterSelectChannelModal extends Component {
  state = {
    loading: false,
    linkStatus: false,
    signErrMsg: '',
    signWarning: '',
    signResult: '',
    redeemScript: '',
  };

  signWithHardware = async () => {
    const {
      model: { dispatch },
      globalStore: {
        modal: {
          data: { desc, isSpecialModel },
        },
      },
    } = this.props;
    const { redeemScript } = this.state;
    this.setState({
      loading: true,
      signErrMsg: '',
      signWarning: `请查看${desc}硬件确认`,
    });
    const res = await dispatch({
      type: 'signWithHardware',
      payload: {
        isSpecialModel,
        redeemScript: isSpecialModel ? redeemScript : null,
      },
    }).catch(err => {
      console.error(err);
      this.setState({
        signErrMsg: err.message,
        loading: false,
        signWarning: '',
      });
    });

    if (res) {
      this.setState({
        signResult: res,
        linkStatus: true,
        loading: false,
        signWarning: '',
        signErrMsg: '',
      });
      return res;
    }
  };

  render() {
    const { linkStatus, signErrMsg, loading, signWarning, redeemScript } = this.state;
    const {
      globalStore: {
        modal: {
          data: { desc, tx, isSpecialModel },
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
            {signWarning && <div className={styles.warning}>{signWarning}</div>}
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
                        isSpecialModel,
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
          {/*<ul>*/}
          {/*<li>*/}
          {/*<span>状态：</span>*/}
          {/*<span>{linkStatus ? '已连接' : '未连接'}</span>*/}
          {/*</li>*/}
          {/*</ul>*/}
          {isSpecialModel && (
            <div className={styles.redeemScript}>
              <Input.Text
                isTextArea
                rows={5}
                label="赎回脚本"
                value={redeemScript}
                onChange={value => {
                  this.setState({
                    redeemScript: value,
                  });
                }}
              />
            </div>
          )}

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
