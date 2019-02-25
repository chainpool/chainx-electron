import React, { lazy, Suspense, Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import { ChainX, parseQueryString } from '../../utils';
import CommonLayOut from './CommonLayOut';
import { SignModal } from '../components';
import { PATH } from '../../constants';
import { AuthorityRoute, Loading } from '../../components';
import routers from './routers';
import { Inject } from '../../utils';
import * as styles from './index.less';

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
      history: {
        location: { search },
      },
    } = this.props;
    // 程序启动时，需要获取这些信息，以保证页面正确显示，如'信托'tab的显示
    dispatch({ type: 'getIntentions' });
  }

  ready = async () => {
    const {
      globalStore: { dispatch: dispatchGlobal },
      accountStore: { dispatch: dispatchAccount },
      electionStore: { dispatch: dispatchElection },
      history: {
        location: { search },
      },
    } = this.props;
    const address = parseQueryString(search).address;
    await ChainX.isRpcReady();
    await dispatchGlobal({
      type: 'setHistory',
      payload: {
        history: this.props.history,
      },
    });
    await dispatchAccount({
      type: 'switchAccount',
      payload: {
        address,
      },
    });
    await dispatchGlobal({ type: 'getAllAssets' });
    await dispatchElection({ type: 'getIntentions' });
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
        <Suspense fallback={<Loading size={60} />}>
          <Switch>
            {routers.map(item => (
              <AuthorityRoute
                authority={item.authority}
                requireTrustee={item.requireTrustee}
                key={item.path}
                path={item.path}
                exact
                render={props => <item.component {...props} {...this.props} />}
              />
            ))}
            <Redirect key={0} to={PATH.default} />
          </Switch>
        </Suspense>
        {name === 'SignModal' ? <SignModal {...this.props} /> : null}
      </CommonLayOut>
    ) : (
      <div className={styles.loading}>
        <div>
          <Loading size={60} />
          <div className={styles.desc}>加载中......</div>
        </div>
      </div>
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
