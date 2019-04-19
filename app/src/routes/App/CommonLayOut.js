import React, { Component } from 'react';
import Header from './Header/Header';
import Content from './Content';
import Footer from './Footer/Footer';
import * as styles from './CommonLayOut.less';
import { ChainX, parseQueryString, classNames } from '../../utils';
import { PATH } from '../../constants';
import { Loading } from '../../components';

class CommonLayOut extends Component {
  // 此组件不要设置startInit 方法
  state = {
    ready: false,
  };

  async componentDidMount() {
    await this.ready();
  }

  ready = async () => {
    const {
      globalStore: { dispatch: dispatchGlobal },
      accountStore: { dispatch: dispatchAccount },
      electionStore: { dispatch: dispatchElection },
      configureStore: { subscribeNodeOrApi, setBestNodeOrApi },
      tradeStore: { dispatch: dispatchTrade },
      history: {
        location: { search },
      },
    } = this.props;
    const address = parseQueryString(search).address;
    const wsPromise = () =>
      Promise.race([
        ChainX.isRpcReady(),
        new Promise((resovle, reject) => {
          setTimeout(() => {
            reject(new Error('请求超时'));
          }, 10000);
        }),
      ]);
    wsPromise()
      .then(async () => {
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
        await dispatchTrade({ type: 'getOrderPairs' });
        this.setState({
          ready: true,
        });
      })
      .catch(err => {
        console.log('当前节点连接超时，切换节点', err);
        subscribeNodeOrApi({
          refresh: false,
          target: 'Node',
          callback: index => {
            setBestNodeOrApi({
              target: 'Node',
              index,
            });
          },
        });
      });
  };

  render() {
    const { ready } = this.state;
    const {
      children,
      history: {
        location: { pathname },
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
      <div className={styles.layout}>
        <Header {...this.props} className={styles.header} />
        <Content {...this.props} className={classNames(styles.content, !ready ? styles.nocontent : null)}>
          {ready || pathname === PATH.configure ? children : <div className={styles.loadingcontent}>{loading}</div>}
        </Content>
        <Footer {...this.props} className={styles.footer} ready={ready} />
      </div>
    );
  }
}

export default CommonLayOut;
