import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { CommonLayOut } from '../components';
import { default as Asset } from '../Asset';
import { default as Election } from '../Election';
import { PATH } from '../../constants';

export default class App extends Component {
  render() {
    return (
      <Router>
        <CommonLayOut>
          <Switch>
            <Route path={PATH.asset} exact render={props => <Asset {...props} {...this.props} />} />
            <Route path={PATH.election} exact render={props => <Election {...props} {...this.props} />} />
          </Switch>
        </CommonLayOut>
      </Router>
    );
  }
}
