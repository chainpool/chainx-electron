import React, { Component } from 'react';
import * as styles from './index.less';

class Node extends Component {
  render() {
    const {} = this.props;
    return (
      <div className={styles.node}>
        <span>最新高度:5,000,000</span>
      </div>
    );
  }
}

export default Node;
