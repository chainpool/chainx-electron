import React, { PureComponent } from 'react';
import * as styles from './index.less';

class Loading extends PureComponent {
  render() {
    const { size = 20 } = this.props;
    return <i className={`iconfont icon-loading ${styles.loadingIcon}`} style={{ fontSize: size }} />;
  }
}

export default Loading;
