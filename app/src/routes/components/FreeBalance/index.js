import React, { Component } from 'react';
import * as styles from './index.less';

class FreeBalance extends Component {
  render() {
    const { label = '可用余额', value, unit } = this.props;
    return (
      <div className={styles.freeBalance}>
        <span>{label}:</span>
        {value} {unit}
      </div>
    );
  }
}

export default FreeBalance;
