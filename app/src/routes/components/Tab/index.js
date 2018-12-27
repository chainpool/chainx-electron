import React, { Component } from 'react';
import { _ } from '../../../utils';
import * as styles from './index.less';

class Tab extends Component {
  render() {
    const { tabs = [], onClick, activeIndex = 0 } = this.props;
    return tabs.length ? (
      <ul className={styles.Tab}>
        {tabs.map((item, index) => (
          <li
            className={activeIndex === index ? styles.active : null}
            key={index}
            onClick={() => {
              _.isFunction(onClick) && onClick(item, index);
            }}>
            {item}
          </li>
        ))}
      </ul>
    ) : null;
  }
}

export default Tab;