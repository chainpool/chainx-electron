import React from 'react';
import { Button, Input, Icon, Mixin } from '../../components';
import { TableTitle, ConfirmAndCancelModal } from '../components';
import { Inject, parseQueryString } from '../../utils';
import NodeManageTable from './NodeManageTable';
import ApiManageTable from './ApiManageTable';
import OperationApiModal from './Modal/OperationApiModal';
import OperationNodeModal from './Modal/OperationNodeModal';
import * as styles from './index.less';

@Inject(({ configureStore: model }) => ({ model }))
class Configure extends Mixin {
  startInit = () => {
    this.subscribe();
  };

  subscribe = () => {
    const {
      model: { dispatch },
      history: {
        location: { search },
      },
    } = this.props;
    const bestNode = parseQueryString(search).bestNode;
    dispatch({
      type: 'subscribeNode',
      payload: {
        refresh: !bestNode,
      },
    });
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
