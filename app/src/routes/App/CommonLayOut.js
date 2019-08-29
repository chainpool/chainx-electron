import React, { Component } from 'react';
import Header from './Header/Header';
import Content from './Content';
import Footer from './Footer/Footer';
import * as styles from './CommonLayOut.less';
import { ChainX, parseQueryString, classNames, setNet } from '../../utils';
import { PATH } from '../../constants';
import { Loading } from '../../components';

class CommonLayOut extends Component {
  // 此组件不要设置startInit 方法
  state = {
    ready: false,
  };

  async componentDidMount() {
    const {
      globalStore: { getCurrentNetWork },
    } = this.props;
    const currentNetWork = getCurrentNetWork();
    this.setNet(currentNetWork.value);
    await this.ready();
  }

  setNet = net => {
    if (net === 'test') {
      setNet('testnet');
    } else if (net === 'main') {
      setNet('mainnet');
    }
  };

  ready = async () => {
    const {
      globalStore: { dispatch: dispatchGlobal, getCurrentNetWork },
      accountStore: { dispatch: dispatchAccount },
      electionStore: { dispatch: dispatchElection },
      configureStore: { subscribeNodeOrApi, setBestNodeOrApi },
      tradeStore: { dispatch: dispatchTrade },
      chainStore: { dispatch: dispatchChain },
      trustStore: { dispatch: dispatchTrust },
      addressManageStore: { dispatch: dispatchAddressManage },
      history: {
        location: { search },
      },
    } = this.props;
    const address = parseQueryString(search).address;
    await dispatchGlobal({
      type: 'setHistory',
      payload: {
        history: this.props.history,
      },
    });
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
        const currentNetWork = getCurrentNetWork();
        let net = await dispatchChain({
          type: 'getChainProperties',
        });
        if (currentNetWork.value !== net) {
          alert(
            `当前节点网络类型(${net})与当前所选择的网络类型(${
              currentNetWork.value
            })不匹配,请检查节点网络类型，默认设置为当前所选择的网络类型${currentNetWork.value}`
          );
          net = currentNetWork.value;
          return false;
        }
        this.setNet(net);
        await dispatchAccount({ type: 'updateAllAccounts' });
        await dispatchTrust({ type: 'updateAllTrust' });
        await dispatchAddressManage({ type: 'updateAllAddress' });
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
      .catch(async err => {
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
          <Loading />
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
