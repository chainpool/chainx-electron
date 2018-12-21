import React, { Component } from 'react';
import * as styles from './index.less';

class TableTitle extends Component {
  render() {
    const { children, title } = this.props;
    return (
      <div className={styles.tableTitle}>
        <div>
          <h5>{title}</h5>
          <div />
        </div>
        <div>{children}</div>
      </div>
    );
  }
}

export default TableTitle;
