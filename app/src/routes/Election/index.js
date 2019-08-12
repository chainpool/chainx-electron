import React from 'react';
import { Dropdown, FormattedMessage, Mixin, Tabs } from '../../components';
import * as styles from './index.less';
import NodeTable from './NodeTable';
import VoteModal from './Modal/VoteModal';
import UnFreezeModal from './Modal/UnFreezeModal';
import InactiveVoteConfirmModal from './Modal/InactiveVoteConfirmModal';
import ActiveValidatorsList from './ActiveValidatorsList';
import { Inject } from '../../utils';
import { dropdownIcon } from '../../resource';

@Inject(({ electionStore: model }) => ({ model }))
class Election extends Mixin {
  state = {
    sort: { name: <FormattedMessage id={'SelfIntentionBonded'} />, value: 'selfVote' },
    searchName: '',
  };
  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    this.fetchPoll(() => dispatch({ type: 'getIntentions' }));
    dispatch({
      type: 'getElectionMembers',
    });
    dispatch({
      type: 'getIntentionImages',
    });
  };

  render() {
    const { sort, searchName } = this.state;
    const {
      accountStore: { currentAddress },
    } = this.props;
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;

    const tabs = currentAddress
      ? [
          <FormattedMessage id={'Candidate'} />,
          <FormattedMessage id={'DropOut'} />,
          <FormattedMessage id={'MyNominations'} />,
        ]
      : [<FormattedMessage id={'Candidate'} />, <FormattedMessage id={'DropOut'} />];

    const getOperations = activeIndex => (
      <div className={styles.operation}>
        {activeIndex !== 2 && (
          <div className={styles.filterandsort}>
            <FormattedMessage id={'SearchNodeName'}>
              {msg => (
                <input
                  placeholder={msg}
                  value={searchName}
                  onChange={e => {
                    this.setState({
                      searchName: e.target.value.trim(),
                    });
                  }}
                />
              )}
            </FormattedMessage>

            <Dropdown
              style={{ top: 30 }}
              zIndex={10003}
              trigger="click"
              drop={
                <span>
                  <FormattedMessage id={'Sort'} />: {sort.name}
                  <span className={styles.triangle}>{dropdownIcon}</span>
                </span>
              }
              place="right-bottom"
              distance={0}
              className={styles.sortdropdowm}>
              <ul className={styles.sortList}>
                {[
                  { name: <FormattedMessage id={'SelfIntentionBonded'} />, value: 'selfVote' },
                  { name: <FormattedMessage id={'TotalVotes'} />, value: 'totalNomination' },
                  // { name: <FormattedMessage id={'NodeName'} />, value: 'name' },
                ].map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      this.setState({
                        sort: item,
                      });
                    }}>
                    {item.name}
                  </li>
                ))}
              </ul>
            </Dropdown>
          </div>
        )}
      </div>
    );

    return (
      <div className={styles.election}>
        <div className={styles.tabLine}>
          <Tabs tabs={tabs} defaultActiveIndex={0}>
            {activeIndex => (
              <>
                {currentAddress ? getOperations(activeIndex) : null}
                {activeIndex === 0 || activeIndex === 1 ? (
                  <div className={styles.ActiveValidatorsListContainer}>
                    <ActiveValidatorsList
                      activeIndex={activeIndex}
                      sort={sort}
                      searchName={searchName}
                      {...this.props}
                    />
                  </div>
                ) : (
                  <div className={styles.nodetable}>
                    <NodeTable activeIndex={activeIndex} {...this.props} />
                  </div>
                )}
              </>
            )}
          </Tabs>
        </div>
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
        {name === 'InactiveVoteConfirmModal' ? <InactiveVoteConfirmModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
