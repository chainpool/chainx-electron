import React, { Component } from 'react';

class Icon extends Component {
  render() {
    const { className = {}, style = {}, name = '' } = this.props;
    return <i className={`iconfont icon-${name} ${className}`} style={style} />;
  }
}

export default Icon;
