import React, { Component } from 'react';
import { classNames } from '../../../utils';
import * as styles from './index.less';

class TableTitle extends Component {
  render() {
    const { children, title, helpTitle = '', className, style } = this.props;
    return (
      <div className={classNames(styles.tableTitle, className)} style={style}>
        <div>
          <h5>{title}</h5>
          {helpTitle ? <div className={styles.helptitle}>{helpTitle}</div> : null}
          <div />
        </div>
        <div>{children}</div>
      </div>
    );
  }
}

export default TableTitle;
