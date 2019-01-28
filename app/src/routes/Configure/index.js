import React from 'react';
import { Button, Input, Icon, Mixin } from '../../components';
import { TableTitle, ConfirmAndCancelModal } from '../components';
import { Inject } from '../../utils';
import NodeManageTable from './NodeManageTable';
import ApiManageTable from './ApiManageTable';
import AddNodeModal from './Modal/AddNodeModal';
import AddApiModal from './Modal/AddApiModal';
import * as styles from './index.less';

@Inject(({ configureStore: model }) => ({ model }))
class Configure extends Mixin {
  startInit = () => {
    // const {
    //   model: { openModal },
    // } = this.props;
    // openModal({
    //   name: 'DeleteApiModal',
    // });
  };
  render() {
    const {
      model: { netWork = [], currentNetWork = {}, dispatch, openModal },
      globalStore: {
        modal: { name },
      },
    } = this.props;

    const tableProps = {
      ...this.props,
      widths: [150, 150, 200, 150, 150],
    };
    return (
      <div className={styles.configure}>
        <div className={styles.title}>
          <TableTitle title="网络设置" />
        </div>
        <div className={styles.network}>
          <span>选择网络类型</span>
          <div>
            <Input.Select
              value={{ label: currentNetWork.name, value: currentNetWork.ip }}
              options={netWork.map(({ name, ip }) => ({ label: name, value: ip }))}
              onChange={({ label: name, value: ip }) =>
                dispatch({
                  type: 'setCurrentNetWork',
                  payload: { name, ip },
                })
              }
            />
          </div>
        </div>

        <TableTitle
          title="节点管理"
          helpTitle={
            <Button type="blank">
              <Icon name="icon-jiedianbushuwendang" />
              查看节点部署文档
            </Button>
          }>
          <Button
            type="blank"
            onClick={() => {
              openModal({
                name: 'AddNodeModal',
              });
            }}>
            <Icon name="icon-tianjia" />
            添加节点
          </Button>
        </TableTitle>
        <NodeManageTable {...tableProps} />

        <TableTitle
          style={{ marginTop: 32 }}
          title="API管理"
          helpTitle={
            <Button type="blank">
              <Icon name="icon-APIbushuwendang" />
              查看API部署文档
            </Button>
          }>
          <Button
            type="blank"
            onClick={() => {
              openModal({
                name: 'AddApiModal',
              });
            }}>
            <Icon name="icon-tianjia" />
            添加API
          </Button>
        </TableTitle>
        <ApiManageTable {...tableProps} />
        {name === 'AddNodeModal' ? <AddNodeModal {...this.props} /> : null}
        {name === 'AddApiModal' ? <AddApiModal {...this.props} /> : null}
        {name === 'DeleteNodeModal' ? <ConfirmAndCancelModal {...this.props} /> : null}
        {name === 'DeleteApiModal' ? <ConfirmAndCancelModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Configure;
