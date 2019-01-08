import React, { Component } from 'react';
import Header from './Header/Header';
import Content from './Content';
import Footer from './Footer/Footer';
import * as styles from './CommonLayOut.less';

class CommonLayOut extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className={styles.layout}>
        <Header {...this.props} className={styles.header} />
        <Content {...this.props} className={styles.content}>
          {children}
        </Content>
        <Footer {...this.props} className={styles.footer} />
      </div>
    );
  }
}

export default CommonLayOut;
