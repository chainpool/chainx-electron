import React, { Component } from 'react';

const nonZeroStyle = {
  color: '#3f3f3f',
};

const zeroStyle = {
  color: '#c2c2c2',
};

class Asset extends Component {
  render() {
    const { value } = this.props;

    return <span style={parseFloat(value) > 0 ? nonZeroStyle : zeroStyle}>{value}</span>;
  }
}

export default Asset;
