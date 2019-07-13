import React, { Component } from 'react';
import { FormattedMessage } from '../../../components';
import { showAssetName } from '../../../utils';
import * as styles from './index.less';

class FreeBalance extends Component {
  render() {
    const { label = <FormattedMessage id={'FreeBalance'} />, value, unit, title = ' ' } = this.props;
    return (
      <div className={styles.freeBalance}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>
          <span>{label}:</span>
          {value} {showAssetName(unit)}
        </div>
      </div>
    );
  }
}

export default FreeBalance;
