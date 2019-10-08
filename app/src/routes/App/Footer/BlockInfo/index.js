import React, { Component } from 'react';
import { Inject, moment_helper } from '../../../../utils';
import * as styles from './index.less';
import { FormattedMessage } from '../../../../components';
@Inject(({ chainStore, electionStore }) => ({ chainStore, electionStore }))
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
    if (this.subscribeNewHead) {
      this.subscribeNewHead.unsubscribe();
    }
  }

  render() {
    const {
      chainStore: { normalizedBlockNumber, blockTime, currentChainProducer },
      electionStore: { validatorsWithRecords, encodeAddressAccountId },
    } = this.props;

    const findNode =
      validatorsWithRecords.find(one => encodeAddressAccountId(one.account) === currentChainProducer) || {};

    return (
      <div className={styles.blockinfo}>
        <span>
          <FormattedMessage id={'BlockTime'} />:<span>{moment_helper.formatHMS(blockTime, 'YYYY/MM/DD HH:mm:ss')}</span>
        </span>
        <span>
          <FormattedMessage id={'LatestHeightBlock'} />:<span>{normalizedBlockNumber}</span>
          {findNode.name && <span className={styles.producer}>({findNode.name})</span>}
        </span>
      </div>
    );
  }
}

export default BlockInfo;
