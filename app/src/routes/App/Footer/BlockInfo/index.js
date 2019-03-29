import React, { Component } from 'react';
import { Inject, moment_helper } from '../../../../utils';
import * as styles from './index.less';
@Inject(({ chainStore }) => ({ chainStore }))
class BlockInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }

  async componentDidMount() {
    const {
      chainStore: { dispatch },
    } = this.props;
    this.subscribeNewHead = await dispatch({
      type: 'subscribeNewHead',
    });
  }

  componentWillUnmount() {
    this.subscribeNewHead.unsubscribe();
  }

  render() {
    const {
      chainStore: { normalizedBlockNumber, blockTime },
    } = this.props;

    return (
      <div className={styles.blockinfo}>
        <span>{moment_helper.formatHMS(blockTime)}</span>
        <span>最新高度:{normalizedBlockNumber}</span>
      </div>
    );
  }
}

export default BlockInfo;
