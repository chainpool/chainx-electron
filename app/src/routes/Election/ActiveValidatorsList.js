import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, RouterGo, Dropdown, FormattedMessage, LanguageContent } from '../../components';
import { ProducerColorChange } from '../components';
import { HoverTip } from '../components';
import { blockChain } from '../../constants';
import { _, observer, groupArrayByCount, classNames, hexPrefix, Inject } from '../../utils';
import trustee_zh from '../../resource/trustee_zh.png';
import trustee_en from '../../resource/trustee_en.png';

@Inject(({ chainStore }) => ({ chainStore }))
class ActiveValidatorsList extends Component {
  render() {
    const {
      activeIndex,
      sort = {},
      searchName,
      model: {
        openModal,
        allActiveValidator = [],
        allInActiveValidator = [],
        setDefaultPrecision,
        decodeAddressAccountId,
        encodeAddressAccountId,
      },
      accountStore: { currentAccount = {}, currentAddress },
      globalStore: { nativeAssetName, language },
      chainStore: { currentChainProducer },
    } = this.props;

    const dataSources = [allActiveValidator, allInActiveValidator][activeIndex];
    let dataSourceResult = _.sortBy([...dataSources], ['name'], ['desc']);

    dataSourceResult.sort((a = {}, b = {}) => {
      return b[sort['value']] - a[sort['value']];
      // const aLength = _.get(a, 'isTrustee.length');
      // const bLength = _.get(b, 'isTrustee.length');
      // if (aLength || bLength) {
      //   if (aLength && bLength) {
      //     return b[sort['value']] - a[sort['value']];
      //   } else {
      //     return bLength - aLength;
      //   }
      // } else {
      //   return b[sort['value']] - a[sort['value']];
      // }
    });

    // const rankFromTotalnomination = [...dataSourceResult].sort((item1, item2) => {
    //   return item2.totalNomination - item1.totalNomination;
    // }); // rank 排名按总得票数算

    dataSourceResult = dataSourceResult.map((item, index) => {
      // const findIndex = [...dataSourceResult].findIndex(one => {
      //   return one.account === item.account;
      // });
      return {
        ...item,
        rank: index + 1,
      };
    });

    if (searchName) {
      dataSourceResult = dataSourceResult.filter(item => {
        return new RegExp(searchName, 'i').test(item.name);
      });
    }

    const groupDataSources = groupArrayByCount(dataSourceResult, 4);

    return (
      <div className={styles.ActiveValidatorsListVersion2}>
        <ul className={styles.list}>
          {groupDataSources.map((one, ins) => (
            <li
              key={ins}
              className={classNames(
                styles.trs,
                groupDataSources.length > 3 && ins > 2 && ins >= groupDataSources.length - 4 ? styles.up : null
              )}>
              <ul>
                {one.map((item, index) => (
                  <ProducerColorChange
                    showChange={item.isActive}
                    Ele={'li'}
                    key={index}
                    item={item}
                    currentChainProducer={currentChainProducer}
                    account={encodeAddressAccountId(item.account)}
                    {...this.props}>
                    <div className={styles.left}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} width={40} height={40} />
                      ) : (
                        <div>{item.name[0].toUpperCase()}</div>
                      )}
                    </div>

                    <div className={styles.right}>
                      <div className={styles.top}>
                        <div className={styles.nameContainer}>
                          <div
                            className={classNames(
                              styles.nodeType,
                              !item.isActive
                                ? styles.inActive
                                : item.isTrustee && item.isTrustee.length
                                ? styles.trustee
                                : item.isValidator
                                ? styles.validator
                                : styles.backupValidators
                            )}
                          />
                          <div>
                            <div className={classNames(styles.overHidden, item.myTotalVote ? styles.myVote : null)}>
                              <span className={styles.name}> {item.name}</span>

                              {item.isTrustee && item.isTrustee.length ? (
                                <span className={styles.trusteeMark}>
                                  (<FormattedMessage id={'Trustee'} />)
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className={styles.buttoncontainer}>
                          {currentAddress ? (
                            <Button
                              type="confirm"
                              className={classNames(
                                language === 'en' ? styles.en : null,
                                styles.votebutton,
                                item.myTotalVote ? styles.show : styles.hidden
                              )}
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
                              {item.myTotalVote ? (
                                <FormattedMessage id={'ChangeNominate'} />
                              ) : (
                                <FormattedMessage id={'NominateQuick'} />
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.down}>
                        <div>
                          <FormattedMessage id={'SelfIntentionBondedQuick'} />:
                          <span>{parseInt(setDefaultPrecision(item.selfVote))}</span>
                        </div>
                        <div>
                          <FormattedMessage id={'TotalVotesQuick'} />:
                          <span>{parseInt(setDefaultPrecision(item.totalNomination))}</span>
                        </div>
                      </div>
                    </div>
                    <div className={classNames(language === 'zh' ? styles.zh : styles.en, styles.Nodedetail)}>
                      <ul>
                        {item.isActive ? (
                          <li>
                            <div>
                              {sort.value === 'selfVote' ? (
                                <FormattedMessage id={'BondedRank'} />
                              ) : (
                                <FormattedMessage id={'VotingRank'} />
                              )}
                            </div>
                            <div>
                              <div className={styles.rank}>{item.rank}</div>
                            </div>
                          </li>
                        ) : null}

                        <li>
                          <div>
                            <FormattedMessage id={'NodeType'} />
                          </div>
                          <div>
                            <div className={styles.nodetype}>
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

                              {item.isTrustee && item.isTrustee.length ? (
                                <FormattedMessage id={'TrusteeNode'} />
                              ) : !item.isActive ? (
                                <FormattedMessage id={'DropOut'} />
                              ) : item.isValidator ? (
                                <FormattedMessage id={'ValidatorNode'} />
                              ) : (
                                <FormattedMessage id={'StandbyNode'} />
                              )}
                            </div>
                          </div>
                        </li>
                        <li>
                          <div>
                            <FormattedMessage id={'NodeWebsite'} />
                          </div>
                          <div>
                            <div className={styles.longaddress}>
                              <RouterGo isOutSide go={{ pathname: item.url }}>
                                {item.url}
                              </RouterGo>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div>
                            <FormattedMessage id={'AccountAddressQuick'} />
                          </div>
                          <div>
                            <div className={styles.longaddress}>
                              <RouterGo
                                isOutSide
                                go={{
                                  pathname: blockChain.chainXAccount(hexPrefix(decodeAddressAccountId(item.address))),
                                }}>
                                {item.address}
                              </RouterGo>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div>
                            <FormattedMessage id={'PoolAddress'} />
                          </div>
                          <div>
                            <div className={styles.longaddress}>
                              <RouterGo
                                isOutSide
                                go={{
                                  pathname: blockChain.chainXAccount(
                                    hexPrefix(decodeAddressAccountId(item.jackpotAddress))
                                  ),
                                }}>
                                {item.jackpotAddress}
                              </RouterGo>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div>
                            <FormattedMessage id={'PoolAmount'} />
                          </div>
                          <div>
                            <div className={styles.longaddress}>{setDefaultPrecision(item.jackpot)}</div>
                          </div>
                        </li>
                        <li>
                          <div className={styles.introduceTitle}>
                            <FormattedMessage id={'ValidatorBrief'} />
                          </div>
                          <div className={styles.introduce}>
                            <div className={styles.introducedetail}>{item.about}</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </ProducerColorChange>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default ActiveValidatorsList;
