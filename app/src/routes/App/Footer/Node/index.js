import React, { Component } from 'react';
import { Icon, Input } from '../../../../components';
import * as styles from './index.less';
import { classNames, Inject, moment_helper } from '@utils/index';
import { parseQueryString } from '../../../../utils';

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
        location: { search },
      },
    } = this.props;
    this.subscribeNewHead = await dispatch({
      type: 'subscribeNewHead',
    });

    // const bestNode = parseQueryString(search).bestNode;
    // dispatchConfig({
    //   type: 'subscribe',
    //   payload: {
    //     refresh: !bestNode,
    //   },
    // });
  }

  componentWillUnmount() {
    this.subscribeNewHead.unsubscribe();
  }

  render() {
    const {
      chainStore: { normalizedBlockNumber, blockTime },
      configureStore: { nodes = [], autoSwitchBestNode, dispatch },
    } = this.props;
    const nodeList = (
      <ul>
        <li>
          <Icon name="icon-xinhao" className={styles.xinhao} />
          杭州节点
          <div className={styles.triangle} />
          <div className={classNames(styles.switchNode, styles.switchfirst)}>
            <ul>
              {nodes.map(item => (
                <li key={item.name}>
                  <div style={{ width: 150 }}>{item.name}</div>
                  <span className={classNames(styles.time, item.delay > 300 ? 'yellow' : 'green')}>{`${
                    item.delay
                  } /ms`}</span>
                </li>
              ))}
              <li key={'best'} className={classNames(styles.api, styles.header)}>
                <Input.Checkbox
                  style={{ width: 14, height: 14 }}
                  className={styles.check}
                  value={autoSwitchBestNode}
                  onClick={() => {
                    dispatch({
                      type: 'updateAutoSwitchBestNode',
                      payload: {
                        autoSwitchBestNode: !autoSwitchBestNode,
                      },
                    });
                  }}
                />
                自动切换最优节点
              </li>
            </ul>
          </div>
        </li>
        {false && (
          <li>
            <Icon name="icon-xinhao" className={styles.xinhao} />
            杭州API
            <div className={styles.triangle} />
            <div className={styles.switchNode}>
              <ul>
                <li key={0} className={classNames(styles.api, styles.header)}>
                  <Input.Checkbox style={{ width: 14, height: 14 }} className={styles.check} />
                  自动切换最优API
                </li>
                {[
                  { name: '杭州公共', time: '56ms' },
                  { name: '北京公共', time: '超时' },
                  { name: '本机私有', time: '80.88%' },
                ].map(item => (
                  <li key={item.name}>
                    {item.name}
                    <span className={styles.time}>{item.time}</span>
                  </li>
                ))}
                <li key="foot" className={styles.footer}>
                  不连接
                </li>
              </ul>
            </div>
          </li>
        )}
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
