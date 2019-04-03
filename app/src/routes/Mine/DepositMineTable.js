import React from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, Mixin, Table } from '../../components';
import { observer } from '../../utils';
import { Balance, HoverTip } from '../components';

@observer
class DepositMineTable extends Mixin {
  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({
      type: 'getPseduIntentions',
    });
    dispatch({
      type: 'getTokenDiscount',
    });
  };

  render() {
    const {
      model: { openModal, dispatch, normalizedPseduIntentions = [], tokenDiscount },
      globalStore: { nativeAssetName },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '排名',
          width: 85,
          dataIndex: 'id',
          render: (value, item, index) => index + 1,
        },
        {
          title: '资产种类',
          dataIndex: 'id',
          width: 120,
        },
        {
          title: '全链总余额',
          ellipse: true,
          dataIndex: 'circulation',
        },
        {
          title: '挖矿算力(PCX)',
          ellipse: true,
          dataIndex: 'price',
          render: (value, item) => {
            return (
              <span>
                <HoverTip tip={item.id === 'SDOT' ? '固定算力，永久挖矿' : `每日均价 * ${tokenDiscount}`}>
                  {' '}
                  {`1: ${value}`}
                </HoverTip>
              </span>
            );
          },
        },
        {
          title: '折合投票数(PCX)',
          dataIndex: 'discountVote',
        },
        {
          title: '奖池金额(PCX)',
          dataIndex: 'jackpot',
          render: value => <Balance value={value} />,
        },
        {
          title: '我的总余额',
          dataIndex: 'balance',
          render: value => <Balance value={value} />,
        },
        {
          title: '待领利息(PCX)',
          dataIndex: 'interest',
          render: value => <Balance value={value} />,
        },
        {
          title: '',
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {item.interest > 0 ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'SignModal',
                      data: {
                        description: [{ name: '操作', value: '提息' }, { name: '资产种类', value: item.id }],
                        callback: () => {
                          return dispatch({
                            type: 'depositClaim',
                            payload: {
                              token: item.id,
                              // target: item.account,
                            },
                          });
                        },
                      },
                    });
                  }}>
                  提息
                </Button>
              ) : null}
            </ButtonGroup>
          ),
        },
      ],
      dataSource: normalizedPseduIntentions,
    };
    return <Table {...tableProps} />;
  }
}

export default DepositMineTable;
