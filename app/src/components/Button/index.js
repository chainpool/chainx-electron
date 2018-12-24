import React from 'react';
import { _, classNames } from '@utils';
import * as styles from './index.less';

export class Button extends React.Component {
  render() {
    const {
      children,
      size = 'middle',
      type = 'outline',
      onClick,
      style = {},
      shape = 'circle',
      className,
    } = this.props;
    return (
      <button
        style={style}
        className={classNames(styles.button, styles[size], styles[type], styles[shape], className)}
        onClick={() => {
          _.isFunction(onClick) && onClick();
        }}>
        {type === 'more' ? <>...</> : children}
      </button>
    );
  }
}

export class ButtonGroup extends React.Component {
  render() {
    const { children } = this.props;
    return <div className={styles.buttonGroup}>{children}</div>;
  }
}
