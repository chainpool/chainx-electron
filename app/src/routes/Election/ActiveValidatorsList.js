import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, RouterGo, Dropdown, FormattedMessage, LanguageContent, Icon } from '../../components';
import { HoverTip, Balance } from '../components';
import { _, observer, groupArrayByCount, classNames } from '../../utils';
import trustee_zh from '../../resource/trustee_zh.png';
import trustee_en from '../../resource/trustee_en.png';
import inactive_zh from '../../resource/inactive_zh.png';
import inactive_en from '../../resource/inactive_en.png';

@observer
class ActiveValidatorsList extends Component {
  render() {
    const {
      activeIndex,
      model: {
        dispatch,
        openModal,
        validators = [],
        backupValidators = [],
        validatorsWithMyNomination = [],
        allActiveValidator = [],
        allInActiveValidator = [],
        setDefaultPrecision,
      },
      accountStore: { currentAccount = {}, currentAddress },
      globalStore: { nativeAssetName },
    } = this.props;

    const dataSources = [[], [], [], allActiveValidator, allInActiveValidator][activeIndex];

    const groupDataSources = groupArrayByCount(dataSources, 5);

    return (
      <div className={styles.ActiveValidatorsList}>
        <table style={{ borderCollapse: 'collapse' }}>
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
                              item.isTrustee && item.isTrustee.length
                                ? styles.trustee
                                : item.isValidator
                                ? styles.validator
                                : styles.backupValidators
                            )}
                          />
                          <span>{item.name}</span>
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
                          <Dropdown drop={'jjjjjj'} place="middle">
                            <div style={{ width: 200, background: 'red' }}>hhhhh</div>
                          </Dropdown>
                        </div>
                        <div>
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
                              <FormattedMessage id={'Nominate'} />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.down}>
                        <div>
                          自抵押数:<span>{parseInt(setDefaultPrecision(item.selfVote))}</span>
                        </div>
                        <div>
                          总得票数:<span>{parseInt(setDefaultPrecision(item.totalNomination))}</span>
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

{
  /*<ul key={ins} className={styles.trs}>*/
}
{
  /*<li>*/
}
{
  /*<ul className={styles.trList}>*/
}
{
  /*{one.map((item, index) => (*/
}
{
  /*<li key={index}>{index}</li>*/
}
{
  /*))}*/
}
{
  /*</ul>*/
}
{
  /*</li>*/
}
{
  /*</ul>*/
}

export default ActiveValidatorsList;
