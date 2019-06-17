import React, { Component } from 'react';
import { formatNumber, Inject, setColumnsWidth, fetchFromHttp, _ } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, Table, FormattedMessage, Icon } from '../../components';
import { HoverTip } from '../components';
import miniLogo from '../../resource/miniLogo.png';
import Asset from './components/Asset';

function loadDynamicScript(callback) {
  const existingScript = document.getElementById('recaptcha');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://www.recaptcha.net/recaptcha/api.js?render=6LeBzJ0UAAAAAEsQxmnaAPNCS-CcsNAkESgoVC1K'; // URL for the third-party library being loaded.
    script.id = 'recaptcha';
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  }

  if (existingScript && callback) callback();
}

function drawCandies(address) {
  if (!address) return;
  loadDynamicScript(() => {
    window.grecaptcha.ready(function() {
      window.grecaptcha.execute('6LeBzJ0UAAAAAEsQxmnaAPNCS-CcsNAkESgoVC1K', { action: 'faucet' }).then(function(token) {
        fetchFromHttp({
          url: 'https://wallet.chainx.org/api/faucet',
          body: { address, token: token },
          method: 'POST',
        })
          .then(() => {
            alert('领取成功，等待打包');
          })
          .catch((err = {}) => {
            if (err.status === 429) {
              alert('请不要重复点击，一小时后领取');
            } else {
              alert(`领取失败${_.get(err, 'message.error_message') ? `,${_.get(err, 'message.error_message')}` : ''}`);
            }
          });
      });
    });
  });
}

@Inject(({ configureStore }) => ({ configureStore }))
class PrimaryAssetTable extends Component {
  render() {
    const {
      model: { openModal, nativeAccountAssets = [], setPrecision },
      globalStore: { nativeAssetPrecision, nativeAssetName },
      configureStore: { isTestNet },
      accountStore: { currentAddress },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: <FormattedMessage id={'Name'} />,
            dataIndex: 'tokenName',
            render: (value, item) => (
              <div className={styles.miniLogo}>
                <img src={miniLogo} alt="miniLogo" />
                <span>
                  <HoverTip tip={item.desc}>{value}</HoverTip>
                </span>
                <span className={styles.shortName}>({item.name})</span>
              </div>
            ),
          },
          {
            title: <FormattedMessage id={'FreeBalance'} />,
            dataIndex: 'free',
            render: value => {
              const tip =
                setPrecision(value, nativeAssetName) <= 0.001 ? (
                  <FormattedMessage id={'LowerAvailableBalanceWarn'}>
                    {msg => (
                      <HoverTip tip={msg}>
                        <Icon name="icon-jieshishuoming" className={styles.warnIcon} />
                      </HoverTip>
                    )}
                  </FormattedMessage>
                ) : null;
              return (
                <>
                  <Asset value={value} precision={nativeAssetPrecision} />
                  {tip}
                </>
              );
            },
          },
          {
            title: <FormattedMessage id={'StakingReserved'} />,
            dataIndex: 'reservedStaking',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: <FormattedMessage id={'UnfreezeReserved'} />,
            dataIndex: 'reservedStakingRevocation',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: <FormattedMessage id={'DexReserved'} />,
            dataIndex: 'reservedDexSpot',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: <FormattedMessage id={'TotalBalance'} />,
            dataIndex: 'total',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => (
              <ButtonGroup>
                {isTestNet && false && (
                  <Button
                    type="warn"
                    onClick={() => {
                      drawCandies(currentAddress);
                    }}>
                    <FormattedMessage id={'GetFreeCoin'} />
                  </Button>
                )}
                <Button
                  type={item.free > 0 ? 'primary' : 'disabled'}
                  onClick={() => {
                    openModal({
                      name: 'TransferModal',
                      data: {
                        token: item.name,
                        freeShow: formatNumber.toPrecision(item.free, nativeAssetPrecision),
                        free: item.free,
                      },
                    });
                  }}>
                  <FormattedMessage id={'Transfer'} />
                </Button>
              </ButtonGroup>
            ),
          },
        ],
        widths
      ),
      dataSource: nativeAccountAssets,
    };
    return <Table {...tableProps} />;
  }
}

export default PrimaryAssetTable;
