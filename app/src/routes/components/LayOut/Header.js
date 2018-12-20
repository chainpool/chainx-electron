import React, { Component } from 'react';
import { RouterGo } from '../../../components';
import routers from '../../App/routers';

class Header extends Component {
  render() {
    const { location: { pathname } = {} } = this.props;
    console.log(this.props);
    return (
      <div>
        <ul>
          {routers.map(item => (
            <RouterGo key={item.path} Ele="li" go={{ pathname: item.path }}>
              {item.title}
              {pathname}
            </RouterGo>
          ))}
        </ul>
      </div>
    );
  }
}

export default Header;
