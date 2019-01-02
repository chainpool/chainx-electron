import React, { Component } from 'react';
import * as styles from './index.less';
import { Icon } from '@components';

class Warn extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className={styles.warn}>
        <Icon name="icon-jinggao" className={styles.icon} />
        {children}
      </div>
    );
  }
}

export default Warn;
