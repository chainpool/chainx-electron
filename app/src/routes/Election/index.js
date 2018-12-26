import React from 'react';
import { Button, Icon, Mixin } from '../../components';
import * as styles from './index.less';
import { Tab } from '../components';
import TableTitle from '../components/TableTitle';
import NodeTable from './NodeTable';
import DepositMineTable from './DepositMineTable';

class Election extends Mixin {
  state = {
    activeIndex: 0,
  };

  startInit = () => {};

  render() {
    const { activeIndex } = this.state;
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
              <div>全网总投票数 878,837,000，每日利息为 0.1%，年化利息约为 37%</div>
              <TableTitle className={styles.tableTitle}>
                <ul>
                  <li>
                    <Button type="blank">
                      <Icon name="icon-xiugaichukuai" />
                      修改出块
                    </Button>
                  </li>
                  <li>
                    <Button type="blank">
                      <Icon name="icon-xiugaipeizhi" />
                      修改配置
                    </Button>
                  </li>
                </ul>
              </TableTitle>
            </>
          )}
        </div>
        {activeIndex === 4 ? <DepositMineTable {...this.props} /> : <NodeTable {...this.props} />}
      </div>
    );
  }
}

export default Election;
