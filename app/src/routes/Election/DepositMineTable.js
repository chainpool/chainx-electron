import React from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, Mixin, Table } from '../../components';
import { observer } from '../../utils';
import Balance from './components/Balance';

@observer
class DepositMineTable extends Mixin {
  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    this.getPseduIntentions$ = await dispatch({
      type: 'getPseduIntentions',
    });
  };

  componentWillUnsubscribe() {
    this.getPseduIntentions$.unsubscribe();
  }
  render() {
    const {
      model: { openModal, dispatch, pseduIntentions = [] },
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
          title: '最新总余额',
          ellipse: true,
          dataIndex: 'circulationShow',
        },
        {
          title: '挖矿算力(PCX)',
          ellipse: true,
          dataIndex: 'priceShow',
        },
        {
          title: '折合投票数',
          dataIndex: 'discountVoteShow',
        },
        {
          title: '奖池金额',
          dataIndex: 'jackpotShow',
        },
        {
          title: '我的总余额',
          dataIndex: 'balanceShow',
          render: value => <Balance value={value} />,
        },
        {
          title: '待领利息',
          dataIndex: 'interestShow',
          render: value => <Balance value={value} />,
        },
        {
          title: '',
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {item.interest ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'SignModal',
                      data: {
                        description: [{ name: '操作', value: '提息' }],
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
      dataSource: pseduIntentions,
    };
    return <Table {...tableProps} />;
  }
}

export default DepositMineTable;
