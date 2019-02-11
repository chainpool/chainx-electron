import React, { Component } from 'react';
import { formatNumber } from '@utils';

const nonZeroStyle = {
  color: '#3f3f3f',
};

const zeroStyle = {
  color: '#c2c2c2',
};

class Asset extends Component {
  render() {
    const { value, precision } = this.props;
    return <span style={value > 0 ? nonZeroStyle : zeroStyle}>{formatNumber.toPrecision(value, precision)}</span>;
  }
}

export default Asset;
