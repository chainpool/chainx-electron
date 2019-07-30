import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, FormattedMessage, Icon, RouterGo } from '../../../components';
import Win from '../../../resource/Win.png';
import Mac from '../../../resource/Mac.png';
import Linux from '../../../resource/Linux.png';
import mathwalletIcon from '../../../resource/mathwalletIcon.png';
import hashkeyIcon from '../../../resource/hashkeyIcon.png';
import hashquarkIcon from '../../../resource/hashquarkIcon.png';

import { Device, classNames } from '../../../utils';
import { DowloadWalletUrl } from '../../../constants';

class DownLoadWallet extends Component {
  render() {
    return (
      <Button type="success" className={styles.download} Ele={'div'}>
        <FormattedMessage id={'DownloadWallet'} />
        <div>
          <div>
            {/*<div className={styles.desc}>*/}
            {/*<Icon name="icon-xiazai" className={styles.downloadicon} />*/}
            {/*<div className={styles.appname}>*/}
            {/*<FormattedMessage id={'DesktopEndSecurityWallet'} />*/}
            {/*</div>*/}
            {/*</div>*/}
            {/*<div className={styles.textdesc}>*/}
            {/*<FormattedMessage id={'DecentralizedFullClientwallet'} />*/}
            {/*</div>*/}

            <div className={styles.appname}>
              <FormattedMessage id={'DesktopEndSecurityWallet'} />
            </div>
            <ul>
              {[
                {
                  src: Win,
                  alias: 'Win',
                  name: 'Windows',
                  url: DowloadWalletUrl.Win,
                },
                {
                  src: Mac,
                  alias: 'Mac',
                  name: 'MacOs',
                  url: DowloadWalletUrl.Mac,
                },
                {
                  src: Linux,
                  alias: 'Linux',
                  name: 'Linux',
                  url: DowloadWalletUrl.Linux,
                },
              ].map(item => (
                <li key={item.name}>
                  <img src={item.src} alt={`${item.src}`} />
                  <div className={styles.name}>{item.name}</div>

                  {item.url && (
                    <div
                      className={classNames(styles.button, Device.getOS() === `${item.alias}` ? styles.active : null)}>
                      <RouterGo isOutSide go={{ pathname: item.url }} className={styles.downloadUrl}>
                        <FormattedMessage id={'Download'} />
                      </RouterGo>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <ul>
              {[
                {
                  src: mathwalletIcon,
                  alias: 'Math Wallet',
                  name: 'Math Wallet',
                  linkUrl: 'http://www.mathwallet.org/cn/',
                },
                {
                  src: hashkeyIcon,
                  alias: 'Hashkey Hub',
                  name: 'Hashkey Hub',
                  linkUrl: 'https://hub.hashkey.com/#/',
                },
                {
                  src: hashquarkIcon,
                  alias: 'HashQuark',
                  name: 'HashQuark',
                  linkUrl: 'https://www.hashquark.io/#/',
                },
              ].map(item => (
                <li key={item.name}>
                  <a href={item.linkUrl} className={styles.linkUrl} target="_blank">
                    <img src={item.src} alt={`${item.src}`} />
                    <div className={styles.name}>{item.name}</div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Button>
    );
  }
}

export default DownLoadWallet;
