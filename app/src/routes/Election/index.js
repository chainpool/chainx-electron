import React from 'react';
import { Button, Icon, Mixin, Tabs, FormattedMessage } from '../../components';
import * as styles from './index.less';
import NodeTable from './NodeTable';
import UpdateNodeModal from './Modal/UpdateNodeModal';
import VoteModal from './Modal/VoteModal';
import UnFreezeModal from './Modal/UnFreezeModal';
import RegisterNodeModal from './Modal/RegisterNodeModal';
import InactiveVoteConfirmModal from './Modal/InactiveVoteConfirmModal';
import { Inject } from '../../utils';
import { HoverTip } from '../components';

@Inject(({ electionStore: model }) => ({ model }))
class Election extends Mixin {
  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getIntentions' });
  };

  render() {
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
      ? [
          <HoverTip tip={'负责全链⽤户交易的记账处理和打包出块'}>
            <FormattedMessage id={'ValidatorNode'} />
          </HoverTip>,
          <HoverTip tip={'负责搭建同步节点接收交易和广播数据'}>
            <FormattedMessage id={'StandbyNode'} />
          </HoverTip>,
          <FormattedMessage id={'MyNominations'} />,
        ]
      : [<FormattedMessage id={'ValidatorNode'} />, <FormattedMessage id={'StandbyNode'} />];

    const operations = (
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
              <HoverTip tip="更新出块地址、网址、简介和节点状态 (参选/退选)">
                <FormattedMessage id={'UpdateNode'} />
              </HoverTip>
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
    );

    return (
      <div className={styles.election}>
        <div className={styles.tabLine}>
          <Tabs tabs={tabs}>
            {activeIndex => (
              <>
                {currentAddress ? operations : null}
                <div className={styles.nodetable}>
                  <NodeTable activeIndex={activeIndex} {...this.props} />
                </div>
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
