import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import { ChainX, parseQueryString } from '../../utils';
import CommonLayOut from './CommonLayOut';
import { SignModal } from '../components';
import { PATH } from '../../constants';
import { AuthorityRoute } from '../../components';
import routers from './routers';
import { Inject } from '../../utils';

@Inject(({ globalStore, accountStore, electionStore }) => ({ globalStore, accountStore, electionStore }))
class Main extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    ready: false,
  };

  async componentDidMount() {
    await this.ready();

    const {
      electionStore: { dispatch },
      globalStore: { dispatch: dispatchGlobal },
      accountStore: { dispatch: dispatchAccount },
      history: {
        location: { search },
      },
    } = this.props;
    const address = parseQueryString(search).address;
    // 程序启动时，需要获取这些信息，以保证页面正确显示，如'信托'tab的显示
    dispatch({ type: 'getIntentions' });
    dispatchGlobal({
      type: 'setHistory',
      payload: {
        history: this.props.history,
      },
    });
    dispatchAccount({
      type: 'switchAccount',
      payload: {
        address,
      },
    });
  }

  ready = async () => {
    await ChainX.isRpcReady();
    this.setState({
      ready: true,
    });
  };

  render() {
    const { ready } = this.state;
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;
    return ready ? (
      <CommonLayOut {...this.props}>
        <Switch>
          {routers.map(item => (
            <AuthorityRoute
              authority={item.authority}
              key={item.path}
              path={item.path}
              exact
              render={props => <item.component {...props} {...this.props} />}
            />
          ))}
          <Redirect key={0} to={PATH.default} />
        </Switch>
        {name === 'SignModal' ? <SignModal {...this.props} /> : null}
      </CommonLayOut>
    ) : (
      '连接中'
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
