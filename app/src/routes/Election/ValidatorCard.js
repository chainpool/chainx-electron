import React, { Component } from 'react';
import { Button, FormattedMessage, LanguageContent, RouterGo } from '../../components';
import { HoverTip } from '../components';
import { blockChain } from '../../constants';
import { _, classNames, groupArrayByCount, hexPrefix, Inject } from '../../utils';
import trustee_zh from '../../resource/trustee_zh.png';
import trustee_en from '../../resource/trustee_en.png';
import officialMember_zh from '../../resource/officialMember_zh.png';
import officialMember_en from '../../resource/officialMember_en.png';
import * as styles from './index.less';

class ValidatorCard extends Component {
  render() {
    const {
      item,
      currentAddress,
      currentAccount,
      openModal,
      setDefaultPrecision,
      decodeAddressAccountId,
      language,
      sort,
    } = this.props;

    return (
      <div className={styles.validatorCard}>
        <div className={styles.left}>
          {item.imageUrl ? (
            <img src={item.imageUrl} width={40} height={40} alt="" />
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
                  !item.isActive ? styles.inActive : item.isValidator ? styles.validator : styles.backupValidators
                )}
              />
              <div>
                <div className={classNames(styles.overHidden, item.myTotalVote ? styles.myVote : null)}>
                  <span className={styles.name}> {item.name}</span>
                  {item.isTrustee && item.isTrustee.length > 0 && (
                    <div className={styles.trusteeImg}>
                      {item.isTrustee && item.isTrustee.length ? (
                        <FormattedMessage id={'ManageUserOutsidechainAssets'}>
                          {msg => (
                            <HoverTip tip={msg}>
                              <LanguageContent
                                zh={<img src={trustee_zh} alt="" height={14} />}
                                en={<img src={trustee_en} alt="" height={14} />}
                              />
                            </HoverTip>
                          )}
                        </FormattedMessage>
                      ) : null}
                    </div>
                  )}
                  {item.isOfficialMember && (
                    <div className={styles.isOfficialMember}>
                      <FormattedMessage id={'ManagePreVoteReferendum'}>
                        {msg => (
                          <HoverTip tip={msg}>
                            <LanguageContent
                              zh={<img src={officialMember_zh} alt="" height={14} />}
                              en={<img src={officialMember_en} alt="" height={14} />}
                            />
                          </HoverTip>
                        )}
                      </FormattedMessage>
                    </div>
                  )}
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
                    item.myTotalVote ? styles.hidden : styles.hidden
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
                          selfVote: setDefaultPrecision(item.selfVote),
                          totalNomination: setDefaultPrecision(item.totalNomination),
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
                  {!item.isActive ? (
                    <FormattedMessage id={'DropOut'} />
                  ) : item.isValidator ? (
                    <FormattedMessage id={'ValidatorNode'} />
                  ) : (
                    <FormattedMessage id={'StandbyNode'} />
                  )}
                </div>
              </div>
            </li>
            {(item.isTrustee && item.isTrustee.length > 0) || item.isOfficialMember ? (
              <li>
                <div>
                  <FormattedMessage id={'NodeDuty'} />
                </div>
                <div>
                  <div className={styles.longaddress}>
                    {item.isTrustee && item.isTrustee.length > 0 && (
                      <span>
                        <FormattedMessage id={'Trustee'} />
                      </span>
                    )}
                    {item.isTrustee && item.isTrustee.length > 0 && item.isOfficialMember && '，'}
                    {item.isOfficialMember && (
                      <span>
                        <FormattedMessage id={'Member'} />
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ) : null}

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
                      pathname: blockChain.chainXAccount(hexPrefix(decodeAddressAccountId(item.jackpotAddress))),
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
      </div>
    );
  }
}

export default ValidatorCard;
