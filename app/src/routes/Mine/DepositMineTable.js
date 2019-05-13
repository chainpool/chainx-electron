import React from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, Mixin, Table, FormattedMessage } from '../../components';
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
  };

  render() {
    const {
      model: { openModal, dispatch, normalizedPseduIntentions = [] },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'Rank'} />,
          width: 85,
          dataIndex: 'id',
          render: (value, item, index) => index + 1,
        },
        {
          title: <FormattedMessage id={'AssetType'} />,
          dataIndex: 'id',
          width: 120,
        },
        {
          title: <FormattedMessage id={'TotalChainBalance'} />,
          ellipse: true,
          dataIndex: 'circulation',
        },
        {
          title: <FormattedMessage id={'MiningPower'}>{msg => `${msg}(PCX)`}</FormattedMessage>,
          ellipse: true,
          dataIndex: 'price',
          render: (value, item) => {
            return (
              <span>
                <HoverTip tip={item.id === 'SDOT' ? '固定算力，永久挖矿' : `每小时均价 * ${item.discount}%`}>
                  {' '}
                  {`1: ${value}`}
                </HoverTip>
              </span>
            );
          },
        },
        {
          title: <FormattedMessage id={'EquivalentNominations'}>{msg => `${msg}(PCX)`}</FormattedMessage>,
          dataIndex: 'discountVote',
        },
        {
          title: <FormattedMessage id={'JackpotBalance'}>{msg => `${msg}(PCX)`}</FormattedMessage>,
          dataIndex: 'jackpot',
          render: value => <Balance value={value} />,
        },
        {
          title: <FormattedMessage id={'MyTotalBalance'} />,
          dataIndex: 'balance',
          render: value => <Balance value={value} />,
        },
        {
          title: <FormattedMessage id={'UnclaimedDividend'}>{msg => `${msg}(PCX)`}</FormattedMessage>,
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
                        description: [
                          { name: 'operation', value: () => <FormattedMessage id={'ClaimDividend'} /> },
                          { name: () => <FormattedMessage id={'AssetType'} />, value: item.id },
                        ],
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
                  <FormattedMessage id={'ClaimDividend'} />
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
