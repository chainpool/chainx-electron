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

@Inject(({ electionStore: model }) => ({ model }))
class Election extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {
    const {
      model: { dispatch },
    } = this.props;
    dispatch({
      type: 'nominate',
    });
  };

  render() {
    const { activeIndex } = this.state;
    const {
      model: { openModal },
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
            <div>按照持有资产兑PCX市值的 50%折合成投票，自动参与充值挖矿获取利息</div>
          ) : (
            <>
              <div>全网总投票数 878,837,000，年化利息约为 4%</div>
              <TableTitle className={styles.tableTitle}>
                <ul>
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
                </ul>
              </TableTitle>
            </>
          )}
        </div>
        {activeIndex === 4 ? <DepositMineTable {...this.props} /> : <NodeTable {...this.props} />}
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'VoteModal' ? <VoteModal {...this.props} /> : null}
        {name === 'UnFreezeModal' ? <UnFreezeModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Election;
