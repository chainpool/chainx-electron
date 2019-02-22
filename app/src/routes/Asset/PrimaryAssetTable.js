import React, { Component } from 'react';
import { formatNumber, Inject, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, Table } from '../../components';
import { HoverTip } from '../components';
import miniLogo from '../../resource/miniLogo.png';
import Asset from './components/Asset';

function drawCandies(address) {
  if (!address) return;
  fetch('https://wallet.chainx.org/server-api/faucet', {
    body: JSON.stringify({
      address,
    }),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    cache: 'no-cache',
    method: 'POST',
  })
    .then(resp => {
      if (resp.status === 200) {
        alert('领取成功，等待打包');
      } else if (resp.status === 429) {
        alert('请不要重复点击，一分钟后领取');
      } else {
        alert('领取失败');
      }
    })
    .catch(() => {
      alert('领取失败');
    });
}

@Inject(({ configureStore }) => ({ configureStore }))
class PrimaryAssetTable extends Component {
  render() {
    const {
      model: { openModal, nativeAccountAssets = [] },
      globalStore: { nativeAssetPrecision },
      configureStore: { isTestNet },
      accountStore: { currentAddress },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'tokenName',
            render: (value, item) => (
              <div className={styles.miniLogo}>
                <img src={miniLogo} alt="miniLogo" />
                <span>
                  <HoverTip tip={item.desc}>{value}</HoverTip>
                </span>
              </div>
            ),
          },
          {
            title: '简称',
            dataIndex: 'name',
          },
          {
            title: '可用余额',
            dataIndex: 'free',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: '投票冻结',
            dataIndex: 'reservedStaking',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: '赎回冻结',
            dataIndex: 'reservedStakingRevocation',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: '交易冻结',
            dataIndex: 'reservedDexSpot',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: '总余额',
            dataIndex: 'total',
            render: value => <Asset value={value} precision={nativeAssetPrecision} />,
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => (
              <ButtonGroup>
                {isTestNet && (
                  <Button
                    type="warn"
                    onClick={() => {
                      drawCandies(currentAddress);
                    }}>
                    领币
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
                  转账
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
