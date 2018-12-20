import React, { Component } from 'react';
import Header from './Header';
import Content from './Content';

class CommonLayOut extends Component {
  render() {
    const { children } = this.props;
    return (
      <div>
        <Header {...this.props} />
        <Content>{children}</Content>
      </div>
    );
  }
}

export default CommonLayOut;
