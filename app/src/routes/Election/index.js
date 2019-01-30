import React from 'react';
import { Button, Icon, Mixin } from '../../components';
import * as styles from './index.less';
import { Tab } from '../components';
import NodeTable from './NodeTable';
import DepositMineTable from './DepositMineTable';
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
      accountStore: { isValidator },
    } = this.props;
    const {
      globalStore: {
        modal: { name },
      },
    } = this.props;

    return (
      <div className={styles.election}>
        <div className={styles.tabLine}>
          <Tab
            tabs={['信托节点', '验证节点', '候选节点', '我的投票', '充值挖矿']}
            activeIndex={activeIndex}
            onClick={(value, index) => {
              this.setState({
                activeIndex: index,
              });
            }}
          />
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
        </div>
        {activeIndex === 4 ? (
          <DepositMineTable {...this.props} />
        ) : (
          <NodeTable activeIndex={activeIndex} {...this.props} />
        )}
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
        {name === 'RegisterNodeModal' ? <RegisterNodeModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
