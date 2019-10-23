import React from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, FormattedMessage, Icon, Mixin, Table } from '../../components';
import { _, Inject, showAssetName } from '../../utils';
import { Balance, HoverTip } from '../components';
import btcIcon from '../../resource/btc.png';
import sdotLogo from '../../resource/xdot.png';
import miniLogo from '../../resource/miniLogo.png';
import LBTCIcon from '../../resource/LBTC.png';

@Inject(({ chainStore, assetStore }) => ({ chainStore, assetStore }))
class DepositMineTable extends Mixin {
  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    this.fetchPoll(() =>
      dispatch({
        type: 'getPseduIntentions',
      })
    );
  };

  render() {
    const {
      chainStore: { blockNumber },
      model: { openModal, dispatch, normalizedPseduIntentions = [] },
      electionStore: { getPseduIntentionsLoading },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'AssetType'} />,
          dataIndex: 'id',
          width: 120,
          render: value => {
            return (
              <div className={styles.miniLogo}>
                <img
                  src={
                    value === 'BTC' ? btcIcon : value === 'SDOT' ? sdotLogo : value === 'L-BTC' ? LBTCIcon : miniLogo
                  }
                  alt="miniLogo"
                />
                {showAssetName(value)}
              </div>
            );
          },
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
                <HoverTip
                  multiline={false}
                  tip={
                    item.id === 'SDOT' ? (
                      <FormattedMessage
                        id={'CrossChainDiscountSdot'}
                        values={{
                          discountShow: item.discountResultShow,
                        }}></FormattedMessage>
                    ) : (
                      <FormattedMessage
                        id={'CrossChainDiscount'}
                        values={{
                          discountShow: item.discountResultShow,
                        }}
                      />
                    )
                  }>
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
          render: value => <Balance keepShowValue value={value} />,
        },
        {
          title: (
            <>
              <FormattedMessage id={'UnclaimedDividend'} />
              (PCX)
              <FormattedMessage id={'RecommendedClaimInterestRegularly'}>
                {msg => (
                  <HoverTip tip={msg}>
                    <Icon name="icon-jieshishuoming" style={{ marginLeft: 5 }} />
                  </HoverTip>
                )}
              </FormattedMessage>
            </>
          ),
          dataIndex: 'interest',
          render: value => <Balance keepShowValue value={value} />,
        },
        {
          title: '',
          dataIndex: '_action',
          render: (value, item) => {
            const isWarn = item.interest > 0;

            return (
              <ButtonGroup>
                <Button
                  type={item.canClaim ? 'success' : isWarn ? 'primary' : 'disabled'}
                  onClick={() => {
                    if (item.canClaim) {
                      openModal({
                        name: 'SignModal',
                        data: {
                          description: [
                            { name: 'operation', value: () => <FormattedMessage id={'ClaimDividend'} /> },
                            { name: () => <FormattedMessage id={'AssetType'} />, value: showAssetName(item.id) },
                          ],
                          callback: () => {
                            return dispatch({
                              type: 'depositClaim',
                              payload: {
                                token: item.id,
                              },
                            });
                          },
                        },
                      });
                    } else if (isWarn) {
                      openModal({
                        name: 'ClaimConditionModal',
                        data: {
                          claimHeight: item.nextClaim,
                          blockNumber,
                          id: item.id,
                        },
                      });
                    }
                  }}>
                  <FormattedMessage id={'ClaimDividend'} />
                </Button>
              </ButtonGroup>
            );
          },
        },
      ],
      dataSource: _.sortBy(normalizedPseduIntentions, ['id']),
      loading: getPseduIntentionsLoading,
    };
    return <Table {...tableProps} />;
  }
}

export default DepositMineTable;
