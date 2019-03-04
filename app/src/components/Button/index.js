import React, { PureComponent } from 'react';
import { _, classNames } from '../../utils';
import * as styles from './index.less';

export class Button extends PureComponent {
  render() {
    const {
      children,
      size = 'middle',
      type = 'primary',
      onClick,
      style = {},
      shape = 'circle',
      className,
      loading = false,
    } = this.props;
    return (
      <button
        style={style}
        className={classNames(
          styles.button,
          styles[size],
          styles[type],
          styles[shape],
          loading ? styles.loading : null,
          className
        )}
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
    const { children, className } = this.props;
    return <div className={classNames(styles.buttonGroup, className)}>{children}</div>;
  }
}
