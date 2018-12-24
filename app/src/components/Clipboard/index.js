import React, { Component } from 'react';
import ClipboardJS from 'clipboard';
import { Tooltip } from '../index';
import { _, classNames } from '../../utils';
import * as styles from './index.less';

export default class Clipboard extends Component {
  state = {
    uid: _.uniqueId('clipboard_'),
  };

  componentDidMount() {
    new ClipboardJS('.clipboard');
  }

  render() {
    const { uid } = this.state;
    const { children, className } = this.props;
    return (
      <span className={classNames(styles.clipboard, className)}>
        <span id={uid} className={styles.children}>
          {children}
        </span>
        <Tooltip tip="复制成功" type="click">
          <i className="clipboard iconfont icon-icon-fuzhi" data-clipboard-target={`#${uid}`} />
        </Tooltip>
      </span>
    );
  }
}
