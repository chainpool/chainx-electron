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
  }

  componentWillUnmount() {}

  render() {
    const {
      chainStore: { normalizedBlockNumber, blockTime, currentChainProducer },
    } = this.props;

    return (
      <div className={styles.blockinfo}>
        <span>
          <FormattedMessage id={'BlockTime'} />:<span>{moment_helper.formatHMS(blockTime, 'YYYY/MM/DD HH:mm:ss')}</span>
        </span>
        <span>
          <FormattedMessage id={'LatestHeightBlock'} />:<span>{normalizedBlockNumber}</span>
        </span>
      </div>
    );
  }
}

export default BlockInfo;
