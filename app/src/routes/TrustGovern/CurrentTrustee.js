import React from 'react';
import { Mixin } from '../../components';
import { groupArrayByCount, Inject } from '../../utils';
import * as styles from './index.less';

@Inject(({ electionStore }) => ({ electionStore }))
class CurrentTrustee extends Mixin {
  startInit = () => {
    this.fetchPoll(this.getIntentions);
    this.fetchPoll(this.getHotColdEntity);
  };

  getIntentions = () => {
    const {
      electionStore: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getIntentions',
    });
  };

  getHotColdEntity = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getHotColdEntity',
    });
  };

  render() {
    const {
      model: { name, dispatch, hotEntity, coldEntity },
      electionStore: { validatorsWithRecords, trustIntentions: trustIntentions_prev },
    } = this.props;
    const trustIntentions = trustIntentions_prev.slice(); // mobx空数组的原因导致需要slice一下

    return (
      <div>
        <table className={styles.trusteeList}>
          <tbody>
            {groupArrayByCount(trustIntentions, 6).map((one, ins) => (
              <tr key={ins}>
                {one.map((item, index) => (
                  <td key={index}>
                    <div>{item.name}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.hotAndCold}>
          <ul>
            {[
              {
                addressDesc: '本届信托热地址：',
                address: hotEntity.addr,
                redeemScriptDesc: '赎回脚本：',
                redeemScript: hotEntity.redeemScript,
              },
              {
                addressDesc: '本届信托热地址：',
                address: coldEntity.addr,
                redeemScriptDesc: '赎回脚本：',
                redeemScript: coldEntity.redeemScript,
              },
            ].map((item, index) => (
              <li key={index}>
                <div>
                  <span>{item.addressDesc}</span>
                  <div>{item.address}</div>
                </div>
                <div>
                  <span>{item.redeemScriptDesc}</span>
                  <div className={styles.redeemScript}>{item.redeemScript}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default CurrentTrustee;
