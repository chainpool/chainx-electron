import React, { Component } from 'react';
import * as styles from './index.less';
import {
  Button,
  ButtonGroup,
  RouterGo,
  Table,
  FormattedMessage,
  LanguageContent,
  Icon,
  DotInCenterStr,
} from '../../components';
import { HoverTip, Balance } from '../components';
import { _, classNames, observer } from '../../utils';
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
      chainStore: { blockNumber },
    } = this.props;

    const dataSources = [
      validators,
      backupValidators,
      validatorsWithMyNomination.map(validator => {
        const canUnfreeze = !!validator.myRevocations.find(revocation => blockNumber > revocation.revocationHeight);

        return {
          ...validator,
          canUnfreeze,
        };
      }),
    ];

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
          width: 124,
          dataIndex: 'name',
          render: (value, item) => (
            <div className={styles.nametd}>
              <div
                className={classNames(
                  styles.nodeType,
                  !item.isActive ? styles.inActive : item.isValidator ? styles.validator : styles.backupValidators
                )}
              />
              {/*{item.isTrustee && item.isTrustee.length ? (*/}
              {/*<div className={styles.trusteeImg}>*/}
              {/*{item.isTrustee && item.isTrustee.length ? (*/}
              {/*<FormattedMessage id={'ManageUserOutsidechainAssets'}>*/}
              {/*{msg => (*/}
              {/*<HoverTip tip={msg}>*/}
              {/*<LanguageContent*/}
              {/*zh={<img src={trustee_zh} alt="" height={14} />}*/}
              {/*en={<img src={trustee_en} alt="" height={14} />}*/}
              {/*/>*/}
              {/*</HoverTip>*/}
              {/*)}*/}
              {/*</FormattedMessage>*/}
              {/*) : null}*/}
              {/*</div>*/}
              {/*) : (*/}
              {/*<div*/}
              {/*className={classNames(*/}
              {/*styles.nodeType,*/}
              {/*!item.isActive*/}
              {/*? styles.inActive*/}
              {/*: item.isTrustee && item.isTrustee.length*/}
              {/*? styles.trustee*/}
              {/*: item.isValidator*/}
              {/*? styles.validator*/}
              {/*: styles.backupValidators*/}
              {/*)}*/}
              {/*/>*/}
              {/*)}*/}
              <HoverTip tip={item.about}>
                <div className={styles.overHidden}>
                  <RouterGo isOutSide go={{ pathname: item.url }}>
                    {value}
                  </RouterGo>
                </div>
              </HoverTip>
            </div>
          ),
        },
        {
          title: <FormattedMessage id={'AccountAddress'} />,
          ellipse: 20,
          width: 124,
          dataIndex: 'address',
          render: value =>
            value === currentAccount.address ? (
              <FormattedMessage id={'ThisAccount'} />
            ) : (
              <DotInCenterStr value={value} />
            ),
        },
        {
          title: <FormattedMessage id={'IntentionSelfNominated'} />,
          ellipse: true,
          width: 124,
          dataIndex: 'selfVote',
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'TotalNomination'} />,
          dataIndex: 'totalNomination',
          width: 124,
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'JackpotBalance'} />,
          dataIndex: 'jackpot',
          width: 124,
          render: value => setDefaultPrecision(value),
        },
        {
          title: <FormattedMessage id={'MyNominations'} />,
          width: 124,
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
              <div className={styles.myTotalVoteAndmyRevocation}>
                <div>
                  <Balance value={setDefaultPrecision(value)} />
                  {tip}
                </div>
              </div>
            );
          },
        },
        {
          title: <FormattedMessage id={'UnfreezeReserved'} />,
          dataIndex: 'myRevocation',
          width: 132,
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: <FormattedMessage id={'UnclaimedDividend'} />,
          dataIndex: 'myInterest',
          width: 124,
          render: value => <Balance value={setDefaultPrecision(value)} />,
        },
        {
          title: '',
          dataIndex: '_action',
          render: (value, item) => (
            <ButtonGroup>
              {item.myRevocation ? (
                <Button
                  type={item.canUnfreeze ? 'highlight' : 'primary'}
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
                    openModal({
                      name: 'VoteModal',
                      data: {
                        isActive: item.isActive,
                        target: item.account,
                        myTotalVote: item.myTotalVote,
                        isCurrentAccount: item.address === currentAccount.address,
                        selfVote: setDefaultPrecision(item.selfVote),
                        totalNomination: setDefaultPrecision(item.totalNomination),
                      },
                    });
                  }}>
                  {item.myTotalVote ? <FormattedMessage id={'ChangeNominate'} /> : <FormattedMessage id={'Nominate'} />}
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
