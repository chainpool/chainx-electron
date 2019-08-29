import React from 'react';

function getSimpleStr(value) {
  if (value && value.length > 13) {
    const length = value.length;
    return value.slice(0, 5) + '...' + value.slice(length - 5, length);
  }
  return value;
}

function SimpleStr(props) {
  const { value, length = 5 } = props;
  const simpleStr = getSimpleStr(value, length);

  return <span>{simpleStr}</span>;
}

export default SimpleStr;
