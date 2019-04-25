import React, { Suspense, Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import { addLocaleData, IntlProvider } from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';
import { zh_CN, en_US } from '../../langs/zh_en.js';

import CommonLayOut from './CommonLayOut';
import { SignModal } from '../components';
import { PATH } from '../../constants';
import { AuthorityRoute, Loading } from '../../components';
import routers from './routers';
import { Inject } from '../../utils';
import * as styles from './index.less';

addLocaleData([...zh, ...en]);

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
        </div>
      </div>
    );

    return (
      <IntlProvider key={'zh'} locale={'zh'} messages={zh_CN}>
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
      </IntlProvider>
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
