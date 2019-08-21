import React, { Component } from 'react';
import * as styles from './index.less';

const nonZeroStyle = {
  color: '#3f3f3f',
};

function zeroSmoke(value) {
  if (value > 0) {
    const str = value.toString();
    const Reg = new RegExp(/0{3,}$/);
    if (Reg.test(str)) {
      return (
        <>
          {str.replace(Reg, '')}
          <span className={styles.opacity4}>{str.match(Reg)[0]}</span>
        </>
      );
    } else {
      return value;
    }
  }
  return <span className={styles.opacity4}>{value}</span>;
}

function numberToAmount(number, precision) {
  const options = {};
  options.minimumFractionDigits = precision;
  options.maximumFractionDigits = precision;
  options.useGrouping = false;

  const value = new Intl.NumberFormat(undefined, options).format(number / Math.pow(10, precision));

  return <>{zeroSmoke(value)}</>;
}

export default class Amount extends Component {
  render() {
    const { value, precision } = this.props;
    return <span style={nonZeroStyle}>{numberToAmount(value, precision)}</span>;
  }
}
