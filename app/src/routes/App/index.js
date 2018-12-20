import React, { Component } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import { default as ChatClub } from '../ChatClub';

export default class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact render={props => <ChatClub {...props} {...this.props} />} />
        </Switch>
      </Router>
    );
  }
}
