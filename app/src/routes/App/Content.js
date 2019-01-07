import React, { Component } from 'react';
import * as styles from './Content.less';

class Content extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className={styles.content}>
        <div>{children}</div>
      </div>
    );
  }
}

export default Content;
