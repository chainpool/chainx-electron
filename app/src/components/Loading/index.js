import React, { PureComponent } from 'react';
import loading from '../../resource/loading.gif';
import * as styles from './index.less';

class LoadingIcon extends PureComponent {
  render() {
    const { size = 30 } = this.props;
    return <i className={`iconfont icon-loading ${styles.loadingIcon}`} style={{ fontSize: size }} />;
  }
}

class Loading extends PureComponent {
  render() {
    const { size = 40 } = this.props;
    return <img style={{ width: size, height: size }} src={loading} alt="" />;
  }
}

export { Loading, LoadingIcon };
