import React, { Component } from 'react';
import { Icon, Input } from '../../../../components';
import { classNames } from '../../../../utils';
import * as styles from './index.less';
import { ChainX } from '@utils/index';

class Node extends Component {
  async componentDidMount() {
    const observable = await ChainX.chain.getBlockNumberObservable();
    this.unsubscribe = observable.subscribe(blockNumber => {
      // TODO: add blockNumber to store
      this.setState({ blockNumber: parseInt(blockNumber) });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render() {
    const blockNumber = (this.state && this.state.blockNumber && this.state.blockNumber.toLocaleString()) || '';

    return (
      <div className={styles.node}>
        <div>
          <span>2019/01/09 16:27:23</span>
          <span>最新高度:{blockNumber}</span>
        </div>
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
      </div>
    );
  }
}

export default Node;
