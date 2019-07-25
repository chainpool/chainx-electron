import React, { PureComponent } from 'react';

class Icon extends PureComponent {
  render() {
    const { className = {}, style = {}, name = '', onClick } = this.props;
    return <i className={`iconfont icon-${name} ${className}`} style={style} onClick={() => onClick && onClick()} />;
  }
}

export default Icon;
