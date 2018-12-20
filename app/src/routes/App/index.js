import React, { Component } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { CommonLayOut } from '../components';
import { default as Asset } from '../Asset';
import { default as Election } from '../Election';

export default class App extends Component {
  render() {
    return (
      <CommonLayOut>
        <Router>
          <Switch>
            <Route path="/" exact render={props => <Asset {...props} {...this.props} />} />
            <Route path="/" exact render={props => <Election {...props} {...this.props} />} />
          </Switch>
        </Router>
      </CommonLayOut>
    );
  }
}
