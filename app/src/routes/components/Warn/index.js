import React, { Component } from 'react';
import { Icon } from '../../../components';
import { classNames } from '../../../utils';
import * as styles from './index.less';

class Warn extends Component {
  render() {
    const { children, className } = this.props;
    return (
      <div className={classNames(styles.warn, className)}>
        <Icon name="icon-jinggao" className={styles.icon} />
        {children}
      </div>
    );
  }
}

export default Warn;
