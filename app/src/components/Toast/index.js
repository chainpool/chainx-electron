import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { _, classNames } from '../../utils';
import * as styles from './index.less';

class Toast {
  constructor() {
    this.interval = null;
    /*
    为了避免react-initl国际化问题
    this.renderElement(_.uniqueId('message'), <ToastContainer />)把<ToastContainer />放到App下面
    */
  }

  renderElement = (id, element) => {
    clearTimeout(this.interval);
    const target = document.getElementById(id);
    if (!target) {
      const toast = document.createElement('div');
      toast.setAttribute('id', id);
      document.body.appendChild(toast);
      ReactDOM.render(element, toast);
      return toast;
    } else {
      target.parentNode.removeChild(target);
      return this.renderElement(id, element);
    }
  };

  tip = (content = '服务错误提示', interval = 2000) => {
    const toast = this.renderElement(
      'tip',
      <div className={styles.toast_tip}>
        <div className={styles.content}>{content}</div>
      </div>
    );
    this.interval = setTimeout(() => {
      toast.parentNode.removeChild(toast);
    }, interval);
  };

  message = (status = 'success', title = 'title', message, options = {}) => {
    const { showStatusIcon = true, newContent, ...rest } = options;
    toast(
      <div className={styles.toast_message}>
        {!newContent ? (
          <>
            <div
              className={classNames(
                styles.title,
                status === 'success' ? styles.success : null,
                status === 'warn' ? styles.warn : null
              )}>
              <div />
              {showStatusIcon ? (
                status === 'success' ? (
                  <i className="iconfont icon-icon-wancheng" />
                ) : (
                  <i className="iconfont icon-icon-cuowu" />
                )
              ) : null}
              {title}
            </div>
            {message ? <div className={styles.desc}>{message}</div> : null}
          </>
        ) : (
          newContent
        )}
      </div>,
      {
        hideProgressBar: true,
        autoClose: 1114000,
        closeButton: false,
        bodyClassName: styles.toast_message_body,
        className: styles.toast_message_content,
        ...rest,
      }
    );
  };

  success = (title, message, options) => {
    this.message('success', title, message, options);
  };

  warn = (title, message, options) => {
    this.message('warn', title, message, options);
  };
}

export default new Toast();
