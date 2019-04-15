import React, { Suspense, Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import CommonLayOut from './CommonLayOut';
import { SignModal } from '../components';
import { PATH } from '../../constants';
import { AuthorityRoute, Loading } from '../../components';
import routers from './routers';
import { Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ globalStore, accountStore, electionStore, configureStore, tradeStore }) => ({
  globalStore,
  accountStore,
  electionStore,
  configureStore,
  tradeStore,
}))
class Main extends Component {
  render() {
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;

    const loading = (
      <div className={styles.loading}>
        <div>
          <Loading size={60} />
          <div className={styles.desc}>加载中......</div>
        </div>
      </div>
    );

    return (
      <CommonLayOut {...this.props}>
        <Suspense fallback={loading}>
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
