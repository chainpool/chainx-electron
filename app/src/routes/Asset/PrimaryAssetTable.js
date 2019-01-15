import React, { Component } from 'react';
import { observer, setColumnsWidth, toJS } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';
import miniLogo from '../../resource/miniLogo.png';

@observer
class PrimaryAssetTable extends Component {
  render() {
    const {
      model: { openModal, primaryAsset = [] },
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
            dataIndex: 'freeShow',
          },
          {
            title: '投票冻结',
            dataIndex: 'reservedStakingShow',
          },
          {
            title: '赎回冻结',
            dataIndex: 'reservedStakingRevocationShow',
          },
          {
            title: '交易冻结',
            dataIndex: 'reservedDexSpotShow',
          },
          {
            title: '总余额',
            dataIndex: 'totalShow',
          },
          {
            title: '',
            dataIndex: '_action',
            render: () => (
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
                        token: 'PCX',
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
      dataSource: primaryAsset,
    };
    return <Table {...tableProps} />;
  }
}

export default PrimaryAssetTable;
