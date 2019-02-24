import React, { Component } from 'react';
import * as styles from './index.less';

class Loading extends Component {
  render() {
    const { size = 20 } = this.props;
    return <i className={`iconfont icon-loading ${styles.loadingIcon}`} style={{ fontSize: size }} />;
  }
}

export default Loading;
