import React, { Component } from 'react';
import { _, classNames } from '../../utils';
import * as styles from './index.less';

export default class Tabs extends Component {
  state = {
    activeIndex: 0,
  };
  render() {
    const { activeIndex } = this.state;
    const { tabs = [], onClick, className } = this.props;
    return tabs.length ? (
      <>
        <ul className={classNames(styles.Tabs, className)}>
          {tabs.map((item, index) => (
            <li
              className={activeIndex === index ? styles.active : null}
              key={index}
              onClick={() => {
                this.setState({
                  activeIndex: index,
                });
                _.isFunction(onClick) && onClick(item, index);
              }}>
              {item}
            </li>
          ))}
        </ul>
        {_.isFunction(this.props.children) && this.props.children(activeIndex)}
      </>
    ) : null;
  }
}
