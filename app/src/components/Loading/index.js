import React, { PureComponent } from 'react';
import loading from '../../resource/loading.gif';
import * as styles from './index.less';

class LoadingIcon extends PureComponent {
  render() {
    const { size = 20 } = this.props;
    return <i className={`iconfont icon-loading ${styles.loadingIcon}`} style={{ fontSize: size }} />;
  }
}

class Loading extends PureComponent {
  render() {
    return <img src={loading} />;
  }
}

export { Loading };
