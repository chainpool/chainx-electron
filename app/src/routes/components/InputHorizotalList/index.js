import React, { Component } from 'react';
import { classNames } from '../../../utils';
import * as styles from './index.less';

class InputHorizotalList extends Component {
  render() {
    const { left, right, className } = this.props;
    return (
      <ul className={classNames(styles.inputHorizotalList, className)}>
        <li>{left}</li>
        <li>{right}</li>
      </ul>
    );
  }
}

export default InputHorizotalList;
