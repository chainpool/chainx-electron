import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import { CommonLayOut } from '../components';
import { PATH } from '../../constants';
import routers from './routers';
import { Inject } from '../../utils';

@Inject(({ globalStore }) => ({ globalStore }))
class Main extends Component {
  render() {
    return (
      <CommonLayOut {...this.props}>
        <Switch>
          {routers.map(item => (
            <Route
              key={item.path}
              path={item.path}
              exact
              render={props => <item.component {...props} {...this.props} />}
            />
          ))}
          <Redirect key={0} to={PATH.asset} />
        </Switch>
      </CommonLayOut>
    );
  }
}

export default class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/user/(.*)?" render={props => <Main {...props} {...this.props} />} />
          <Route path="/" render={props => <Main {...props} {...this.props} />} />
        </Switch>
      </Router>
    );
  }
}
