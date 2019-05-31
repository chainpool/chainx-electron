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
      Ele = 'button',
      canClick = true,
    } = this.props;
    return (
      <Ele
        style={style}
        className={classNames(
          styles.button,
          styles[size],
          styles[type],
          styles[shape],
          loading ? styles.loading : null,
          !canClick ? styles.notClick : null,
          className
        )}
        onClick={() => {
          canClick && _.isFunction(onClick) && onClick();
        }}>
        {type === 'more' ? <>...</> : children}
      </Ele>
    );
  }
}

export class ButtonGroup extends React.Component {
  render() {
    const { children, className } = this.props;
    return <div className={classNames(styles.buttonGroup, className)}>{children}</div>;
  }
}
