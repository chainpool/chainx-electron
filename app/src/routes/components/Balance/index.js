import React, { Component } from 'react';

const nonZeroStyle = {
  color: '#3f3f3f',
};

const zeroStyle = {
  color: '#c2c2c2',
};

class Balance extends Component {
  render() {
    const { value } = this.props;

    return <span style={parseFloat(value) > 0 ? nonZeroStyle : zeroStyle}>{parseFloat(value) > 0 ? value : '-'}</span>;
  }
}

export default Balance;
