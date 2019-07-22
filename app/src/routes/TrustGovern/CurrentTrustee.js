import React, { Component } from 'react';
import * as styles from './index.less';

class CurrentTrustee extends Component {
  render() {
    const {
      model: { name },
    } = this.props;
    return (
      <div>
        <div className={styles.trusteeList}>
          {new Array(16).fill({ name: 'build' }).map((item, index) => (
            <li key={index}>{item.name}</li>
          ))}
        </div>
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
