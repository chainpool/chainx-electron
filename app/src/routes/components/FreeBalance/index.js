import React, { Component } from 'react';
import * as styles from './index.less';

class FreeBalance extends Component {
  render() {
    const { label = '可用余额', value, unit, title = ' ' } = this.props;
    return (
      <div className={styles.freeBalance}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>
          <span>{label}:</span>
          {value} {unit}
        </div>
      </div>
    );
  }
}

export default FreeBalance;
