import React from 'react';
import { Button, Input, Icon, Mixin, ButtonGroup, RouterGo } from '../../components';
import { TableTitle, ConfirmAndCancelModal } from '../components';
import { Inject } from '../../utils';
import NodeManageTable from './NodeManageTable';
import ApiManageTable from './ApiManageTable';
import OperationApiModal from './Modal/OperationApiModal';
import OperationNodeModal from './Modal/OperationNodeModal';
import * as styles from './index.less';

@Inject(({ configureStore: model }) => ({ model }))
class Configure extends Mixin {
  render() {
    const {
      model: { netWork = [], currentNetWork = {}, dispatch, openModal },
      globalStore: {
        modal: { name },
      },
    } = this.props;

    const tableProps = {
      ...this.props,
      widths: [150, 150, 250, 150, 150],
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
              value={{ label: currentNetWork.name, value: currentNetWork.value }}
              options={netWork.map(({ name, value }) => ({ label: name, value }))}
              onChange={({ label: name, value }) => {
                dispatch({
                  type: 'setCurrentNetWork',
                  payload: { name, value },
                });

                window.location.reload();
              }}
            />
          </div>
        </div>

        <TableTitle title="节点管理">
          <ButtonGroup className={styles.settingButton}>
            <Button type="blank">
              <RouterGo isOutSide go={{ pathname: 'https://github.com/chainx-org/ChainX/wiki/Testnet' }}>
                <Icon name="icon-jiedianbushuwendang" />
                <span className={styles.document}>查看节点部署文档</span>
              </RouterGo>
            </Button>
            <Button
              type="blank"
              onClick={() => {
                openModal({
                  name: 'OperationNodeModal',
                  data: {
                    action: 'add',
                    callback: ({ action, name, address }) => {
                      dispatch({
                        type: 'updateNodeOrApi',
                        payload: {
                          target: 'Node',
                          action,
                          name,
                          address,
                        },
                      });
                    },
                  },
                });
              }}>
              <Icon name="icon-tianjia" />
              添加节点
            </Button>
          </ButtonGroup>
        </TableTitle>
        <NodeManageTable {...tableProps} />

        <TableTitle style={{ marginTop: 32 }} title="API管理">
          <ButtonGroup className={styles.settingButton}>
            <Button
              type="blank"
              onClick={() => {
                openModal({
                  name: 'OperationApiModal',
                  data: {
                    action: 'add',
                    callback: ({ action, name, address }) => {
                      dispatch({
                        type: 'updateNodeOrApi',
                        payload: {
                          target: 'Api',
                          action,
                          name,
                          address,
                        },
                      });
                    },
                  },
                });
              }}>
              <Icon name="icon-tianjia" />
              添加API
            </Button>
          </ButtonGroup>
        </TableTitle>
        <ApiManageTable {...tableProps} />
        {name === 'OperationNodeModal' ? <OperationNodeModal {...this.props} /> : null}
        {name === 'OperationApiModal' ? <OperationApiModal {...this.props} /> : null}
        {name === 'DeleteNodeModal' ? <ConfirmAndCancelModal {...this.props} /> : null}
        {name === 'DeleteApiModal' ? <ConfirmAndCancelModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Configure;
