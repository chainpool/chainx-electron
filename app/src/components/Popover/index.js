import React from 'react';
import { default as Pop } from 'react-popover';
import * as styles from './index.less';

export default class Popover extends React.Component {
  state = {
    isOpen: false,
  };

  render() {
    const { isOpen } = this.state;
    const { children, body } = this.props;
    return (
      <Pop
        preferPlace="below"
        isOpen={isOpen}
        body={
          <div
            className={styles.popovercontainer}
            onClick={() => {
              this.setState({
                isOpen: false,
              });
            }}>
            {body}
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
          {children}
        </div>
      </Pop>
    );
  }
}
