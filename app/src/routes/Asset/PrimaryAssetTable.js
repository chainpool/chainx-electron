import React, { Component } from 'react';
import { formatNumber, Inject, setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Button, ButtonGroup, Table } from '../../components';
import miniLogo from '../../resource/miniLogo.png';

@Inject(({ globalStore }) => ({ globalStore }))
class PrimaryAssetTable extends Component {
  render() {
    const {
      model: { openModal, nativeAccountAssets = [] },
      globalStore: { nativeAssetPrecision },
      widths,
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '名称',
            dataIndex: 'name',
            render: value => (
              <div className={styles.miniLogo}>
                <img src={miniLogo} alt="miniLogo" />
                <span>{value}</span>
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
            render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
          },
          {
            title: '投票冻结',
            dataIndex: 'reservedStaking',
            render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
          },
          {
            title: '赎回冻结',
            dataIndex: 'reservedStakingRevocation',
            render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
          },
          {
            title: '交易冻结',
            dataIndex: 'reservedDexSpot',
            render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
          },
          {
            title: '总余额',
            dataIndex: 'total',
            render: value => formatNumber.toPrecision(value, nativeAssetPrecision),
          },
          {
            title: '',
            dataIndex: '_action',
            render: (value, item) => (
              <ButtonGroup>
                <Button
                  type="warn"
                  onClick={() => {
                    openModal({
                      name: 'GetCollarModal',
                    });
                  }}>
                  领币
                </Button>
                <Button
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
