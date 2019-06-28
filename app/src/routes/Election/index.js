import React from 'react';
import { Button, Icon, Mixin, Tabs, FormattedMessage, Dropdown } from '../../components';
import * as styles from './index.less';
import NodeTable from './NodeTable';
import UpdateNodeModal from './Modal/UpdateNodeModal';
import VoteModal from './Modal/VoteModal';
import UnFreezeModal from './Modal/UnFreezeModal';
import RegisterNodeModal from './Modal/RegisterNodeModal';
import InactiveVoteConfirmModal from './Modal/InactiveVoteConfirmModal';
import ActiveValidatorsList from './ActiveValidatorsList';
import { Inject } from '../../utils';
import { HoverTip } from '../components';
import { dropdownIcon } from '../../resource';

@Inject(({ electionStore: model }) => ({ model }))
class Election extends Mixin {
  state = {
    sort: { name: '自抵押', value: 'selfVote' },
    searchName: '',
  };
  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    this.fetchPoll(() => dispatch({ type: 'getIntentions' }));
  };

  render() {
    const { sort, searchName } = this.state;
    const {
      model: { openModal },
      accountStore: { isValidator, currentAddress },
    } = this.props;
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;

    const tabs = currentAddress
      ? ['参选节点', '退选节点', <FormattedMessage id={'MyNominations'} />]
      : [<FormattedMessage id={'ValidatorNode'} />, <FormattedMessage id={'StandbyNode'} />];

    const operations = (
      <div className={styles.operation}>
        <div className={styles.filterandsort}>
          <input
            placeholder={'输入节点名搜索'}
            value={searchName}
            onChange={e => {
              this.setState({
                searchName: e.target.value.trim(),
              });
            }}
          />
          <Dropdown
            trigger="click"
            drop={
              <span>
                排序: {sort.name}
                <span className={styles.triangle}>{dropdownIcon}</span>
              </span>
            }
            place="right-bottom"
            distance={30}
            className={styles.sortdropdowm}>
            <ul className={styles.sortList}>
              {[
                { name: '自抵押', value: 'selfVote' },
                { name: '总得票', value: 'totalNomination' },
                { name: '节点名', value: 'name' },
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
        <ul>
          {isValidator ? (
            <li>
              <Button
                type="blank"
                onClick={() => {
                  openModal({
                    name: 'UpdateNodeModal',
                  });
                }}>
                <Icon name="icon-xiugaipeizhi" />
                <FormattedMessage id={'UpdateNodeTip'}>
                  {msg => (
                    <HoverTip tip={msg}>
                      <FormattedMessage id={'UpdateNode'} />
                    </HoverTip>
                  )}
                </FormattedMessage>
              </Button>
            </li>
          ) : (
            <li>
              <Button
                type="blank"
                onClick={() => {
                  openModal({
                    name: 'RegisterNodeModal',
                  });
                }}>
                <Icon name="icon-xiugaipeizhi" />
                <HoverTip tip="注册并成功部署后，即可参与验证节点选举">
                  <FormattedMessage id={'RegisterNode'} />
                </HoverTip>
              </Button>
            </li>
          )}
        </ul>
      </div>
    );

    return (
      <div className={styles.election}>
        <div className={styles.tabLine}>
          <Tabs tabs={tabs} defaultActiveIndex={0}>
            {activeIndex => (
              <>
                {currentAddress ? operations : null}
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
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
        {name === 'RegisterNodeModal' ? <RegisterNodeModal {...this.props} /> : null}
        {name === 'InactiveVoteConfirmModal' ? <InactiveVoteConfirmModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
