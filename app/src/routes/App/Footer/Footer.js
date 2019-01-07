import React, { Component } from 'react';
import Node from './Node';
import * as styles from './Footer.less';

class Footer extends Component {
  render() {
    return (
      <div className={styles.footer}>
        <div>
          <Node {...this.props} />
        </div>
      </div>
    );
  }
}

export default Footer;
