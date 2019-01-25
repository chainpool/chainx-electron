import React from 'react';
import { Mixin } from '../../components';
import * as styles from './index.less';
import { TableTitle } from '../components';
import TrustTable from './TrustTable';
import { Inject } from '@utils';

@Inject(({ trustStore: model }) => ({ model }))
class Trust extends Mixin {
  state = {};

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getAllWithdrawalList' });
  };

  render() {
    return (
      <div className={styles.trust}>
        <TableTitle title="信托列表" />
        <TrustTable {...this.props} />
      </div>
    );
  }
}

export default Trust;
