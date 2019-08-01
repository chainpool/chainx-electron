import React, { PureComponent } from 'react';
import { default as Pop } from 'react-popover';
import * as styles from './index.less';

export default class Popover extends PureComponent {
  state = {
    isOpen: false,
  };

  render() {
    const { isOpen } = this.state;
    const { children, body, className, place = 'above', ...rest } = this.props;
    return (
      <Pop
        className={styles.popoverride}
        target={children}
        {...rest}
        isOpen={isOpen}
        body={body}
        place={place}
        preferPlace={'end'}
        onOuterAction={() => {
          this.setState({
            isOpen: false,
          });
        }}>
        <span
          onClick={() => {
            this.setState({
              isOpen: !isOpen,
            });
          }}>
          {children}
        </span>
      </Pop>
    );
  }
}
