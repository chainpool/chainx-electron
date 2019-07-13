import React, { Component } from 'react';
import { _, classNames } from '../../../utils';
import * as styles from './index.less';

class Tab extends Component {
  render() {
    const { tabs = [], onClick, activeIndex = 0, className, renderItem } = this.props;
    return tabs.length ? (
      <ul className={classNames(styles.Tab, className)}>
        {tabs.map((item, index) => (
          <li
            className={activeIndex === index ? styles.active : null}
            key={index}
            onClick={() => {
              _.isFunction(onClick) && onClick(item, index);
            }}>
            {_.isFunction(renderItem) ? renderItem(item) : item}
          </li>
        ))}
      </ul>
    ) : null;
  }
}

export default Tab;
