import React, { Component } from 'react';
import Node from './Node';
import { classNames } from '../../../utils';
import * as styles from './Footer.less';

class Footer extends Component {
  render() {
    const { className } = this.props;
    return (
      <div className={classNames(styles.footer, className)}>
        <div>
          <Node {...this.props} />
        </div>
      </div>
    );
  }
}

export default Footer;
