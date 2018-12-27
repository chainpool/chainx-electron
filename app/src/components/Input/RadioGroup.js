import React from 'react';
import * as styles from './index.less';
export class RadioGroup extends React.Component {
  render() {
    const { children } = this.props;
    return <div className={styles.radioGroup}>{children}</div>;
  }
}

export default RadioGroup;
