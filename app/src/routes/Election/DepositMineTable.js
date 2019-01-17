import React, { Component } from 'react';
import * as styles from './index.less';
import { Table, ButtonGroup, Button, Mixin } from '../../components';
import { observer, toJS } from '../../utils';

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
          width: 50,
          dataIndex: 'id',
          render: (value, item, index) => index + 1,
        },
        {
          title: '资产种类',
          dataIndex: 'id',
        },
        {
          title: '最新总余额',
          ellipse: true,
          dataIndex: 'circulationShow',
        },
        {
          title: '移动平均价(PCX)',
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
        },
        {
          title: '待领利息',
          dataIndex: 'data8',
        },
        {
          title: '',
          dataIndex: '_action',
          render: () => (
            <ButtonGroup>
              <Button
                onClick={() => {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [{ name: '操作', value: '提息' }],
                      callback: ({ signer, acceleration }) => {
                        dispatch({
                          type: 'claim',
                          payload: {
                            signer,
                            acceleration,
                            // target: item.account,
                          },
                        });
                      },
                    },
                  });
                }}>
                提息
              </Button>
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
