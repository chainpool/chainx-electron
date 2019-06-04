import React, { Suspense, Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { addLocaleData, IntlProvider } from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';
import { zh_CN, en_US } from '../../langs/zh_en.js';

import CommonLayOut from './CommonLayOut';
import { SignModal, LowerPCXWarn } from '../components';
import { PATH, ShowLanguage } from '../../constants';
import { AuthorityRoute, Loading } from '../../components';
import routers from './routers';
import { Inject, toJS } from '../../utils';
import * as styles from './index.less';

addLocaleData([...zh, ...en]);

const log = console.log;
console.log = (...payload) => {
  const payloads = payload.map(item => toJS(item));
  log(...payloads);
};

@Inject(
  ({
    globalStore,
    accountStore,
    electionStore,
    configureStore,
    tradeStore,
    chainStore,
    trustStore,
    addressManageStore,
  }) => ({
    globalStore,
    accountStore,
    electionStore,
    configureStore,
    tradeStore,
    chainStore,
    trustStore,
    addressManageStore,
  })
)
class Main extends Component {
  render() {
    const {
      globalStore: {
        modal: { name },
        language,
      },
    } = this.props;

    const loading = (
      <div className={styles.loading}>
        <div>
          <Loading size={60} />
        </div>
      </div>
    );

    const getMessages = () => {
      switch (language) {
        case 'zh':
          return zh_CN;
        case 'en':
          return en_US;
      }
    };

    return (
      <IntlProvider locale={ShowLanguage ? language : 'zh'} messages={ShowLanguage ? getMessages() : zh_CN}>
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
          {name === 'LowerPCXWarn' ? <LowerPCXWarn {...this.props} /> : null}
          <ToastContainer />
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
