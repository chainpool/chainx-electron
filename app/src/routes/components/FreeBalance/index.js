import React, { Component } from 'react';
import * as styles from './index.less';

class FreeBalance extends Component {
  render() {
    const { value, unit } = this.props;
    return (
      <div className={styles.freeBalance}>
        <span>可用余额:</span>
        {value} {unit}
      </div>
    );
  }
}

export default FreeBalance;
