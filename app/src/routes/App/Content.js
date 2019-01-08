import React, { Component } from 'react';
import { classNames } from '../../utils';
import * as styles from './Content.less';

class Content extends Component {
  render() {
    const { children, className } = this.props;
    return (
      <div className={classNames(styles.content, className)}>
        <div>{children}</div>
      </div>
    );
  }
}

export default Content;
