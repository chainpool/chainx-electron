import React, { PureComponent } from 'react';

class Icon extends PureComponent {
  render() {
    const { className = {}, style = {}, name = '' } = this.props;
    return <i className={`iconfont icon-${name} ${className}`} style={style} />;
  }
}

export default Icon;
