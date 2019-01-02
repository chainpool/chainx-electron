import React from 'react';
import { default as Pop } from 'react-popover';
import { classNames } from '../../utils';
import * as styles from './index.less';

export default class Popover extends React.Component {
  state = {
    isOpen: false,
  };

  render() {
    const { isOpen } = this.state;
    const { children, body, className, target, appendTarget } = this.props;
    return (
      <Pop
        target={target}
        appendTarget={appendTarget}
        preferPlace="below"
        isOpen={isOpen}
        body={
          <div
            className={classNames(styles.popovercontainer, className)}
            onClick={() => {
              this.setState({
                isOpen: false,
              });
            }}>
            {children}
          </div>
        }
        onOuterAction={e => {
          this.setState({
            isOpen: false,
          });
        }}
        className={styles.popoverride}>
        <div
          className="me"
          onClick={e => {
            this.setState({
              isOpen: !isOpen,
            });
          }}>
          {body}
        </div>
      </Pop>
    );
  }
}
