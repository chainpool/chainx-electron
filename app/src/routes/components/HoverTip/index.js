import React, { Component } from 'react';
import { Tooltip } from '../../../components';

export default class HoverTip extends Component {
  render() {
    const { children, tip, offset, ...rest } = this.props;
    return (
      <Tooltip tip={tip} offset={offset} place={'top'} {...rest}>
        {children}
      </Tooltip>
    );
  }
}
