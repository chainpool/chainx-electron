import React, { Component } from 'react';
import * as styles from './index.less';

class InputHorizotalList extends Component {
  render() {
    const { left, right } = this.props;
    return (
      <ul className={styles.inputHorizotalList}>
        <li>{left}</li>
        <li>{right}</li>
      </ul>
    );
  }
}

export default InputHorizotalList;
