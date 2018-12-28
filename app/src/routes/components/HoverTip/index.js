import React, { Component } from 'react';
import { Tooltip } from '../../../components';

export default class HoverTip extends Component {
  render() {
    const { children, offset, ...rest } = this.props;
    return (
      <Tooltip tip={children} offset={offset} {...rest}>
        <i
          className="iconfont icon-icon-jieshishuoming"
          style={{
            color: '#3da0d2',
            margin: '0 4px',
          }}
        />
      </Tooltip>
    );
  }
}
