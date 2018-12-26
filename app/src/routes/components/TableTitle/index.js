import React, { Component } from 'react';
import { classNames } from '../../../utils';
import * as styles from './index.less';

class TableTitle extends Component {
  render() {
    const { children, title, className } = this.props;
    return (
      <div className={classNames(styles.tableTitle, className)}>
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
