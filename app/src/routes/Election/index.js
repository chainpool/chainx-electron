import React from 'react';
import { Button, Icon, Mixin } from '../../components';
import * as styles from './index.less';
import { Tab } from '../components';
import NodeTable from './NodeTable';
import UpdateNodeModal from './Modal/UpdateNodeModal';
import VoteModal from './Modal/VoteModal';
import UnFreezeModal from './Modal/UnFreezeModal';
import RegisterNodeModal from './Modal/RegisterNodeModal';
import { Inject } from '../../utils';

@Inject(({ electionStore: model }) => ({ model }))
class Election extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = async () => {
    const {
      model: { dispatch },
    } = this.props;

    dispatch({ type: 'getIntentions' });
  };

  render() {
    const { activeIndex } = this.state;
    const {
      model: { openModal },
      accountStore: { isValidator, currentAddress },
    } = this.props;
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;

    // const tabs = ['信托节点', '验证节点', '候选节点', '我的投票', '充值挖矿'];
    const tabs = currentAddress
      ? ['信托节点', '验证节点', '候选节点', '我的投票']
      : ['信托节点', '验证节点', '候选节点'];

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
              更新节点
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
              注册节点
            </Button>
          </li>
        )}
      </ul>
    );

    return (
      <div className={styles.election}>
        <div className={styles.tabLine}>
          <Tab
            tabs={tabs}
            activeIndex={activeIndex}
            onClick={(value, index) => {
              this.setState({
                activeIndex: index,
              });
            }}
          />
          {currentAddress ? operations : null}
        </div>
        <NodeTable activeIndex={activeIndex} {...this.props} />
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
        {name === 'RegisterNodeModal' ? <RegisterNodeModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
