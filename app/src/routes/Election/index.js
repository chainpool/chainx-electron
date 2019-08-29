import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
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
      model: { dispatch },
      location: { pathname } = {},
      accountStore: { currentAddress },
      electionStore: { lastPath },
    } = this.props;
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;

    const subRoutePath = ['/election/allActiveValidator', '/election/allInactiveValidator', '/election/myNominations'];
    const candidate = {
      path: subRoutePath[0],
      text: <FormattedMessage id={'Candidate'} />,
    };
    const dropout = {
      path: subRoutePath[1],
      text: <FormattedMessage id={'DropOut'} />,
    };
    const myNominations = {
      path: subRoutePath[2],
      text: <FormattedMessage id={'MyNominations'} />,
    };

    const tabs = currentAddress ? [candidate, dropout, myNominations] : [candidate, dropout];

    const getOperations = () => (
      <div className={styles.operation}>
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
      </div>
    );

    return (
      <div className={styles.election}>
        <div className={styles.tabLine}>
          <ul className={styles.tab}>
            {tabs.map((item, index) => (
              <li
                className={pathname === item.path ? styles.active : null}
                key={index}
                onClick={() => {
                  if (pathname === item.path) {
                    return;
                  }
                  dispatch({
                    type: 'updateLastPath',
                    payload: item.path,
                  });
                  this.props.history.push(item.path);
                }}>
                {item.text}
              </li>
            ))}
          </ul>
          {currentAddress && pathname !== subRoutePath[2] ? getOperations() : null}
          <Switch>
            <Route exact path="/election" render={() => <Redirect to={lastPath} />} />
            <Route
              path={subRoutePath[0]}
              render={props => (
                <div className={styles.ActiveValidatorsListContainer}>
                  <ActiveValidatorsList activeIndex={0} sort={sort} searchName={searchName} {...this.props} />
                </div>
              )}
            />
            <Route
              path={subRoutePath[1]}
              render={props => (
                <div className={styles.ActiveValidatorsListContainer}>
                  <ActiveValidatorsList activeIndex={1} sort={sort} searchName={searchName} {...this.props} />
                </div>
              )}
            />
            <Route
              path={subRoutePath[2]}
              render={props => (
                <div className={styles.nodetable}>
                  <NodeTable activeIndex={2} {...this.props} />
                </div>
              )}
            />
          </Switch>
        </div>
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
        {name === 'InactiveVoteConfirmModal' ? <InactiveVoteConfirmModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
