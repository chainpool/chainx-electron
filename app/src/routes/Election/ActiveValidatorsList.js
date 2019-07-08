import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, RouterGo, Dropdown, FormattedMessage, LanguageContent } from '../../components';
import { HoverTip } from '../components';
import { blockChain } from '../../constants';
import { _, observer, groupArrayByCount, classNames, hexPrefix } from '../../utils';
import trustee_zh from '../../resource/trustee_zh.png';
import trustee_en from '../../resource/trustee_en.png';

@observer
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
      },
      accountStore: { currentAccount = {}, currentAddress },
      globalStore: { nativeAssetName },
    } = this.props;

    const dataSources = [allActiveValidator, allInActiveValidator][activeIndex];
    let dataSourceResult = _.sortBy([...dataSources], ['name'], ['desc']);

    dataSourceResult.sort((a = {}, b = {}) => {
      const aLength = _.get(a, 'isTrustee.length');
      const bLength = _.get(b, 'isTrustee.length');
      if (aLength || bLength) {
        if (aLength && bLength) {
          return b[sort['value']] - a[sort['value']];
        } else {
          return bLength - aLength;
        }
      } else {
        return b[sort['value']] - a[sort['value']];
      }
    });

    const rankFromTotalnomination = [...dataSourceResult].sort((item1, item2) => {
      return item2.totalNomination - item1.totalNomination;
    }); // rank 排名按总得票数算

    dataSourceResult = dataSourceResult.map(item => {
      const findIndex = rankFromTotalnomination.findIndex(one => {
        return one.account === item.account;
      });
      return {
        ...item,
        rank: findIndex + 1,
      };
    });

    if (searchName) {
      dataSourceResult = dataSourceResult.filter(item => {
        return new RegExp(searchName, 'i').test(item.name);
      });
    }

    const groupDataSources = groupArrayByCount(dataSourceResult, 5);

    return (
      <div className={styles.ActiveValidatorsList}>
        <table style={{ borderCollapse: 'collapse' }} className={styles.alltable}>
          <tbody>
            {groupDataSources.map((one, ins) => (
              <tr key={ins} className={styles.trs}>
                {one.map((item, index) => (
                  <td key={index}>
                    <div>
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
                          <span>
                            <HoverTip tip={item.about}>
                              <div className={classNames(styles.overHidden, item.myTotalVote ? styles.myVote : null)}>
                                {item.name}
                              </div>
                            </HoverTip>
                          </span>
                          {item.isTrustee && item.isTrustee.length ? (
                            <FormattedMessage id={'ManageUserOutsidechainAssets'}>
                              {msg => (
                                <HoverTip tip={msg}>
                                  <LanguageContent
                                    zh={<img src={trustee_zh} alt="" height={18} />}
                                    en={<img src={trustee_en} alt="" width={45} />}
                                  />
                                </HoverTip>
                              )}
                            </FormattedMessage>
                          ) : null}
                          <Dropdown
                            distance={20}
                            drop={<i className={classNames('iconfont icon-icon-jieshishuoming', styles.helpicon)} />}
                            place={ins === 0 ? 'middle-bottom' : 'middle-top'}>
                            <div className={styles.Nodedetail}>
                              <table style={{ borderCollapse: 'collapse' }}>
                                <tbody>
                                  {item.isActive ? (
                                    <tr>
                                      <td>
                                        <FormattedMessage id={'VoteRank'} />
                                      </td>
                                      <td>
                                        <div>{item.rank}</div>
                                      </td>
                                    </tr>
                                  ) : null}

                                  <tr>
                                    <td>
                                      <FormattedMessage id={'NodeType'} />
                                    </td>
                                    <td>
                                      <div className={styles.nodetype}>
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
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <FormattedMessage id={'NodeWebsite'} />
                                    </td>
                                    <td>
                                      <div className={styles.longaddress}>
                                        <RouterGo isOutSide go={{ pathname: item.url }}>
                                          {item.url}
                                        </RouterGo>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <FormattedMessage id={'AccountAddressQuick'} />
                                    </td>
                                    <td>
                                      <div className={styles.longaddress}>
                                        <RouterGo
                                          isOutSide
                                          go={{
                                            pathname: blockChain.chainXAccount(
                                              hexPrefix(decodeAddressAccountId(item.address))
                                            ),
                                          }}>
                                          {item.address}
                                        </RouterGo>
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <FormattedMessage id={'PoolAddress'} />
                                    </td>
                                    <td>
                                      <div className={styles.longaddress}>{item.jackpotAddress}</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <FormattedMessage id={'PoolAmount'} />
                                    </td>
                                    <td>
                                      <div className={styles.longaddress}>{setDefaultPrecision(item.jackpot)}</div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </Dropdown>
                        </div>
                        <div className={styles.buttoncontainer}>
                          {currentAddress ? (
                            <Button
                              type="confirm"
                              className={styles.votebutton}
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
                              <FormattedMessage id={'NominateQuick'} />
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
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ActiveValidatorsList;
