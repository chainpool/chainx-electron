import React, { Component } from 'react';
import { classNames } from '@utils';
import * as styles from './index.less';

const width = 190;
class ColorProgress extends Component {
  render() {
    const { value, max = {}, direction = '' } = this.props;
    let percent = '';
    if (max.totalAmountShow) {
      percent = value / max.totalAmountShow;
    }
    return (
      <div
        style={{ width: width * percent }}
        className={classNames(styles.colorProgress, direction === 'Buy' ? styles.buy : styles.sell)}
      />
    );
  }
}

export default ColorProgress;
