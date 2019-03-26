import React, { Component } from 'react';
import { Icon, Input, Toast } from '../../../../components';
import * as styles from './index.less';
import { classNames, Inject, moment_helper, parseQueryString } from '../../../../utils';
import { PATH } from '../../../../constants';
@Inject(({ chainStore, configureStore }) => ({ chainStore, configureStore }))
class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }

  async componentDidMount() {
    const {
      chainStore: { dispatch },
      configureStore: { dispatch: dispatchConfig },
      history: {
        location: { pathname, search },
      },
    } = this.props;
    this.subscribeNewHead = await dispatch({
      type: 'subscribeNewHead',
    });
    const bestNode = parseQueryString(search).bestNode;
    if (pathname !== PATH.configure) {
      dispatchConfig({
        type: 'subscribeNodeOrApi',
        payload: {
          refresh: !bestNode,
          target: 'Node',
        },
      });
      dispatchConfig({
        type: 'subscribeNodeOrApi',
        payload: {
          refresh: !bestNode,
          target: 'Api',
        },
      });
    }
  }

  componentWillUnmount() {
    this.subscribeNewHead.unsubscribe();
  }

  render() {
    const {
      chainStore: { normalizedBlockNumber, blockTime },
      configureStore: { nodes = [], api = [], autoSwitchBestNode, autoSwitchBestApi, dispatch, getBestNodeAndApi },
    } = this.props;
    const [bestNode = {}, bestApi = {}] = getBestNodeAndApi();
    const nodeList = (
      <ul>
        {[nodes, api].map((one = [], index) => (
          <li key={index}>
            <Icon name="icon-xinhao" className={styles.xinhao} />
            <span className={styles.apiornodename}>{index ? bestApi.name : bestNode.name}</span>
            <div className={styles.triangle} />
            <div className={classNames(styles.switchNode, index ? styles.switchsecond : styles.switchfirst)}>
              <ul>
                {one.map((item, ins) => (
                  <li
                    className={item.best ? styles.active : null}
                    key={item.name}
                    onClick={() => {
                      if (!item.block) {
                        return Toast.warn(`未获取到当前${index ? 'Api' : '节点'}同步状态，无法连接`);
                      }
                      if (item.best) return false;
                      dispatch({
                        type: 'setBestNodeOrApi',
                        payload: {
                          target: index ? 'Api' : 'Node',
                          index: ins,
                        },
                      });
                      dispatch({
                        type: index ? 'updateAutoSwitchBestApi' : 'updateAutoSwitchBestNode',
                        payload: {
                          ...(index ? { autoSwitchBestApi: false } : { autoSwitchBestNode: false }),
                        },
                      });
                    }}>
                    <div className={styles.name}>{item.name}</div>
                    {item.delay === 'timeOut' ? (
                      <span className={'red'}>超时</span>
                    ) : (
                      <span className={classNames(styles.time, item.delay > 300 ? 'yellow' : 'green')}>{`${
                        item.delay
                      } /ms`}</span>
                    )}
                  </li>
                ))}
                {index ? (
                  <li
                    key={'best'}
                    className={classNames(styles.api, styles.header)}
                    onClick={() => {
                      dispatch({
                        type: 'updateAutoSwitchBestApi',
                        payload: {
                          autoSwitchBestApi: !autoSwitchBestApi,
                        },
                      });
                      // window.location.reload();
                    }}>
                    <Input.Checkbox
                      style={{ width: 14, height: 14 }}
                      className={styles.check}
                      value={autoSwitchBestApi}
                    />
                    自动切换最优API
                  </li>
                ) : (
                  <li
                    key={'best'}
                    className={classNames(styles.api, styles.header)}
                    onClick={() => {
                      dispatch({
                        type: 'updateAutoSwitchBestNode',
                        payload: {
                          autoSwitchBestNode: !autoSwitchBestNode,
                        },
                      });
                    }}>
                    <Input.Checkbox
                      style={{ width: 14, height: 14 }}
                      className={styles.check}
                      value={autoSwitchBestNode}
                    />
                    自动切换最优节点
                  </li>
                )}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    );

    return (
      <div className={styles.node}>
        <div>
          <span>{moment_helper.formatHMS(blockTime)}</span>
          <span>最新高度:{normalizedBlockNumber}</span>
        </div>
        {/*TODO: 暂时隐藏节点及api选择*/}
        {nodeList}
      </div>
    );
  }
}

export default Node;
