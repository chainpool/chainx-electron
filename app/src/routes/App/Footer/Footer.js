import React, { Component } from 'react';
import Node from './Node';
import BlockInfo from './BlockInfo';
import { classNames, Inject } from '../../../utils';
import * as styles from './Footer.less';

@Inject(({ configureStore }) => ({ configureStore }))
class Footer extends Component {
  render() {
    const {
      className,
      configureStore: { nodes },
    } = this.props;

    return (
      <div className={classNames(styles.footer, className)}>
        <div>
          <BlockInfo {...this.props} />
          <Node {...this.props} nodes={nodes} />
        </div>
      </div>
    );
  }
}

export default Footer;
