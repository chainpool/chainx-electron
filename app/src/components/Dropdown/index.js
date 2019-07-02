import React, { Component } from 'react';
import classNames from 'classnames';
import * as styles from './index.less';

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { toggled: false };
    this.wrapperRef = React.createRef();
  }

  componentDidMount() {
    const { trigger } = this.props;
    trigger === 'click' && document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    const { trigger } = this.props;
    trigger === 'click' && document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleToggle = () => {
    const { trigger } = this.props;
    trigger === 'click' && this.setState(prevState => ({ toggled: !prevState.toggled }));
  };

  handleClick = () => {
    this.setState(prevState => ({ toggled: !prevState.toggled }));
  };

  handleClickOutside = evt => {
    if (this.state.toggled && this.wrapperRef && !this.wrapperRef.current.contains(evt.target)) {
      this.setState({ toggled: false });
    }
  };

  render() {
    const { toggled } = this.state;
    const {
      trigger = 'hover',
      place = 'left', //'left,left-bottom,left-top,right,right-top.right-bottom,top,bottom'
      distance = 10,
      width,
      drop = 'drop按钮',
      children: down = <div>down</div>,
      zIndex = 10001,
      style = {},
    } = this.props;
    if (trigger === 'hover') {
    } else if (trigger === 'click') {
    }

    let [left, right, bottom, top] = [];
    if (place.includes('left')) {
      left = 0;
    } else if (place.includes('right')) {
      right = 0;
    } else if (place.includes('middle')) {
      left = '50%';
    }
    if (place.includes('bottom')) {
      bottom = 0;
    } else if (place.includes('top')) {
      top = 0;
    }

    const styleMerge = {
      width,
      left,
      right,
      top: bottom,
      bottom: top,
      zIndex: zIndex,
      ...(place.includes('middle') ? { transform: 'translate(-50%, 0%)' } : {}),
      ...style,
    };

    return trigger === 'hover' ? (
      <div className={classNames(styles.dropdown, styles[trigger])}>
        <div className={styles.dropArea}>{drop}</div>
        <div className={styles.downAreaContainer} style={styleMerge}>
          <div
            className={styles.downArea}
            style={{
              ...(top === 0 ? { marginBottom: distance } : { marginTop: distance }),
            }}>
            {down}
          </div>
        </div>
      </div>
    ) : (
      <div ref={this.wrapperRef} className={classNames(styles.dropdown, styles[trigger])}>
        <div onClick={this.handleToggle} className={styles.dropArea}>
          {drop}
        </div>
        {toggled && (
          <div className={styles.downAreaContainer} style={styleMerge}>
            <div
              onClick={this.handleClick}
              className={styles.downArea}
              style={{
                ...(top === 0 ? { marginBottom: distance } : { marginTop: distance }),
              }}>
              {down}
            </div>
          </div>
        )}
      </div>
    );
  }
}
