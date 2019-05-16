import React, { Component } from 'react';
import { default as ReactModal } from 'react-modal';
import { _, Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ globalStore: model }) => ({ model }))
class Modal extends Component {
  componentWillUnmount() {
    this.closeModal();
  }

  closeModal = () => {
    const { onClose, model } = this.props;
    if (_.isFunction(onClose)) {
      return _.isFunction(onClose) && onClose();
    }
    model.closeModal();
  };

  render() {
    const {
      children,
      model: { modal: { status = false } = {} },
      title = '',
      button,
      onAfterOpen,
      style = {},
      isOverflow = false,
    } = this.props;

    return (
      <ReactModal
        parentSelector={() => document.getElementById('overContent') || document.body}
        style={{
          overlay: {
            zIndex: 100001,
            background: style.background || 'rgba(0,0,0,.4)',
          },
          content: {
            boxShadow: '0 6px 12px 0 rgba(0,0,0,0.20)',
            background: 'transparent',
            width: style.width || 580,
            ...(isOverflow ? { overflowX: 'unset', overflowY: 'unset' } : { overflowX: 'hidden', overflowY: 'hidden' }),
            border: 'none',
            padding: 0,
            margin: 0,
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
        onAfterOpen={onAfterOpen}
        isOpen={status}>
        <div className={styles.modalcontainer}>
          <div className={styles.header}>
            <div className={styles.label}>{title}</div>
            <span
              className={styles.close}
              onClick={() => {
                this.closeModal();
              }}>
              <i className="iconfont icon-icon-guanbi" />
            </span>
          </div>
          <div className={styles.content}>
            {children}
            {button ? <div className={styles.button}>{button}</div> : null}
          </div>
        </div>
      </ReactModal>
    );
  }
}

ReactModal.setAppElement(document.getElementById('root'));

export default Modal;
