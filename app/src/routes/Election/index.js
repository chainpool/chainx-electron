import React from 'react';
import { Button, Icon, Mixin } from '../../components';
import * as styles from './index.less';
import { Tab } from '../components';
import TableTitle from '../components/TableTitle';
import NodeTable from './NodeTable';
import DepositMineTable from './DepositMineTable';
import UpdateNodeModal from './Modal/UpdateNodeModal';
import VoteModal from './Modal/VoteModal';
import UnFreezeModal from './Modal/UnFreezeModal';
import { Inject } from '../../utils';

@Inject(({ electionStore: model, accountStore }) => ({ model, accountStore }))
class Election extends Mixin {
  state = {
    activeIndex: 3,
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
            tabs={['信托节点', '结算节点', '候补节点', '我的选举', '充值挖矿']}
            activeIndex={activeIndex}
            onClick={(value, index) => {
              this.setState({
                activeIndex: index,
              });
            }}
          />
        </div>
        <div className={styles.titledesc}>
          {activeIndex === 4 ? (
            <div className={styles.desc}>按照持有资产兑PCX市值的 50%折合成投票，自动参与充值挖矿获取利息</div>
          ) : (
            <>
              <TableTitle className={styles.tableTitle}>
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
                  ) : null}
                </ul>
              </TableTitle>
            </>
          )}
        </div>
        {activeIndex === 4 ? (
          <DepositMineTable {...this.props} />
        ) : (
          <NodeTable activeIndex={activeIndex} {...this.props} />
        )}
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
