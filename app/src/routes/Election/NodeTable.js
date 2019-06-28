import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, RouterGo, Table, FormattedMessage, LanguageContent, Icon } from '../../components';
import { HoverTip, Balance } from '../components';
import { _, observer } from '../../utils';
import trustee_zh from '../../resource/trustee_zh.png';
import trustee_en from '../../resource/trustee_en.png';
import inactive_zh from '../../resource/inactive_zh.png';
import inactive_en from '../../resource/inactive_en.png';

@observer
class NodeTable extends Component {
  render() {
    const {
      activeIndex,
      model: {
        dispatch,
        openModal,
        validators = [],
        backupValidators = [],
        validatorsWithMyNomination = [],
        setDefaultPrecision,
      },
      accountStore: { currentAccount = {}, currentAddress },
      globalStore: { nativeAssetName },
    } = this.props;

    const dataSources = [validators, backupValidators, validatorsWithMyNomination];

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        activeIndex === 2
          ? null
          : {
              title: <FormattedMessage id={'Rank'} />,
              width: 110,
              ellipse: 8,
              dataIndex: 'name',
              render: (value, item, index) => {
                return (
                  <div className={styles.trustee}>
                    <span className={styles.rank}>{index + 1}</span>
                    {item.isTrustee && item.isTrustee.length ? (
                      <FormattedMessage id={'ManageUserOutsidechainAssets'}>
                        {msg => (
                          <HoverTip tip={msg}>
                            <LanguageContent
                              zh={<img src={trustee_zh} alt="" />}
                              en={<img src={trustee_en} alt="" />}
                            />
                          </HoverTip>
                        )}
                      </FormattedMessage>
                    ) : null}
                    {!item.isActive && (
                      <FormattedMessage id={'ElectionValidatorUnableParticipate'}>
                        {msg => (
                          <HoverTip tip={msg}>
                            <LanguageContent
                              zh={<img src={inactive_zh} alt="" />}
                              en={<img src={inactive_en} alt="" />}
                            />
                          </HoverTip>
                        )}
                      </FormattedMessage>
                    )}
                  </div>
                );
              },
            },
        {
          title: <FormattedMessage id={'Name'} />,
          ellipse: 10,
          width: 100,
          dataIndex: 'name',
          render: (value, item) => (
            <HoverTip tip={item.about}>
              <div className={styles.overHidden}>
                <RouterGo isOutSide go={{ pathname: item.url }}>
                  {value}
                </RouterGo>
              </div>
            </HoverTip>
          ),
        },
        {
          title: <FormattedMessage id={'AccountAddress'} />,
          ellipse: 10,
          width: 100,
          dataIndex: 'address',
          render: value => (value === currentAccount.address ? <FormattedMessage id={'ThisAccount'} /> : value),
        },
        {
          title: <FormattedMessage id={'IntentionSelfNominated'} />,
          ellipse: true,
          dataIndex: 'selfVote',
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'TotalNomination'} />,
          dataIndex: 'totalNomination',
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'JackpotBalance'} />,
          dataIndex: 'jackpot',
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'MyNominations'} />,
          dataIndex: 'myTotalVote',
          render: (value, item) => {
            const tip =
              value && !item.isActive ? (
                <FormattedMessage id={'InactiveJackpotNotIncrease'}>
                  {msg => (
                    <HoverTip tip={msg}>
                      <Icon name="icon-jieshishuoming" className={styles.warnIcon} />
                    </HoverTip>
                  )}
                </FormattedMessage>
              ) : null;

            return (
              <>
                <Balance value={setDefaultPrecision(value)} />
                {tip}
              </>
            );
          },
        },
        {
          title: <FormattedMessage id={'UnfreezeReserved'} />,
          dataIndex: 'myRevocation',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: <FormattedMessage id={'UnclaimedDividend'} />,
          dataIndex: 'myInterest',
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: '',
          width: 150,
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {item.myRevocation ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'UnFreezeModal',
                      data: {
                        account: item.account,
                        myRevocations: item.myRevocations,
                      },
                    });
                  }}>
                  <FormattedMessage id={'Unfreeze'} />
                </Button>
              ) : null}
              {item.myInterest ? (
                <Button
                  onClick={() => {
                    openModal({
                      name: 'SignModal',
                      data: {
                        description: [
                          { name: 'operation', value: () => <FormattedMessage id={'ClaimDividend'} /> },
                          { name: () => <FormattedMessage id={'AssetType'} />, value: nativeAssetName },
                        ],
                        checkNativeAsset: (accountNativeAssetFreeBalance, fee, minValue) => {
                          if (minValue === 0) {
                            return accountNativeAssetFreeBalance - fee >= minValue;
                          } else {
                            return (
                              Number(accountNativeAssetFreeBalance - fee) +
                                Number(setDefaultPrecision(item.myInterest)) >
                              minValue
                            );
                          }
                        },
                        callback: () => {
                          return dispatch({
                            type: 'voteClaim',
                            payload: {
                              target: item.account,
                            },
                          });
                        },
                      },
                    });
                  }}>
                  <FormattedMessage id={'ClaimDividend'} />
                </Button>
              ) : null}
              {currentAddress ? (
                <Button
                  onClick={() => {
                    const vote = () =>
                      openModal({
                        name: 'VoteModal',
                        data: {
                          isActive: item.isActive,
                          target: item.account,
                          myTotalVote: item.myTotalVote,
                          isCurrentAccount: item.address === currentAccount.address,
                        },
                      });
                    vote();
                  }}>
                  <FormattedMessage id={'Nominate'} />
                </Button>
              ) : null}
            </ButtonGroup>
          ),
        },
      ].filter(item => item),
      dataSource: dataSources[activeIndex].sort((a = {}, b = {}) => {
        const aLength = _.get(a, 'isTrustee.length');
        const bLength = _.get(b, 'isTrustee.length');
        if (aLength || bLength) {
          if (aLength && bLength) {
            return b.totalNomination - a.totalNomination;
          } else {
            return bLength - aLength;
          }
        }
        return b.totalNomination - a.totalNomination;
      }),
    };
    return <Table {...tableProps} />;
  }
}

export default NodeTable;
