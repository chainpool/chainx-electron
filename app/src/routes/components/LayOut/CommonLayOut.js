import React, { Component } from 'react';
import Header from './Header';
import Content from './Content';

class CommonLayOut extends Component {
  render() {
    const { children } = this.props;
    return (
      <div>
        <Header />
        <Content>{children}</Content>
      </div>
    );
  }
}

export default CommonLayOut;
