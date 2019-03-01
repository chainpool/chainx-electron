import React, { Component } from 'react';
import { Icon, Input } from '../../../../components';
import * as styles from './index.less';
import { classNames, Inject, moment_helper } from '@utils/index';

@Inject(({ chainStore }) => ({ chainStore }))
class Node extends Component {
  static count = 0;
  constructor(props) {
    super(props);
    this.state = { date: new Date() };
  }

  componentDidMount() {
    const {
      chainStore: { dispatch },
    } = this.props;
    dispatch({
      type: 'subscribeNewHead',
      payload: {
        callback: blockTime => {
          const isLocal = /localhost/.test(window.location.href);
          if (!Node.count && moment_helper.diff(blockTime, Date.now()) > 10 && !isLocal) {
            alert('ChainX测试网已暂停，无法发送交易，只能查看，请稍后再测。');
            Node.count += 1;
          }
        },
      },
    });
  }

  componentWillUnmount() {
    const {
      chainStore: { dispatch },
    } = this.props;

    dispatch({ type: 'unSubscribeNewHead' });
  }

  render() {
    const {
      chainStore: { normalizedBlockNumber, blockTime },
    } = this.props;

    // eslint-disable-next-line no-used-vars
    const nodeList = (
      <ul>
        <li>
          <Icon name="icon-xinhao" className={styles.xinhao} />
          杭州节点
          <div className={styles.triangle} />
          <div className={classNames(styles.switchNode, styles.switchfirst)}>
            <ul>
              <li key={0} className={classNames(styles.api, styles.header)}>
                <Input.Checkbox style={{ width: 14, height: 14 }} className={styles.check} />
                自动切换最优节点
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
            </ul>
          </div>
        </li>
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
      </ul>
    );

    return (
      <div className={styles.node}>
        <div>
          <span>{moment_helper.formatHMS(blockTime)}</span>
          <span>最新高度:{normalizedBlockNumber}</span>
        </div>
        {/*TODO: 暂时隐藏节点及api选择*/}
        {false && nodeList}
      </div>
    );
  }
}

export default Node;
