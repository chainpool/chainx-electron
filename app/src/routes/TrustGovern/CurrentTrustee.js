import React, { Component } from 'react';
import { groupArrayByCount } from '../../utils';
import * as styles from './index.less';

class CurrentTrustee extends Component {
  render() {
    const {
      model: { name },
    } = this.props;
    const trusteeList = new Array(16).fill({ name: 'build' });
    return (
      <div>
        <table className={styles.trusteeList}>
          <tbody>
            {groupArrayByCount(trusteeList, 6).map((one, ins) => (
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
                address: '212FXXHrCjHAQUshe3Vr1hAH2jBRqmRk59',
                redeemScriptDesc: '赎回脚本：',
                redeemScript: '5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa19…',
              },
              {
                addressDesc: '本届信托热地址：',
                address: '212FXXHrCjHAQUshe3Vr1hAH2jBRqmRk59',
                redeemScriptDesc: '赎回脚本：',
                redeemScript: '5345773718cb9c8d0cb9c8d09aa5345773718cb9c8d0cb9c8d09aa9aa19…',
              },
            ].map((item, index) => (
              <li key={index}>
                <div>
                  {item.addressDesc}
                  {item.address}
                </div>
                <div>
                  {item.redeemScriptDesc}
                  {item.redeemScript}
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
