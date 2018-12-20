import React, { Component } from 'react';
import { RouterGo } from '../../../components';
import { PATH } from '../../../constants';

class Header extends Component {
  render() {
    return (
      <div>
        <ul>
          <RouterGo Ele="li" go={{ pathname: PATH.asset }}>
            资产
          </RouterGo>
          <RouterGo Ele="li" go={{ pathname: PATH.election }}>
            选举
          </RouterGo>
        </ul>
      </div>
    );
  }
}

export default Header;
