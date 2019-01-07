import React, { Component } from 'react';
import { setColumnsWidth } from '../../utils';
import * as styles from './index.less';
import { Table, Button, ButtonGroup } from '../../components';

class ApiManageTable extends Component {
  render() {
    const {
      model: { openModal },
      widths = [],
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: setColumnsWidth(
        [
          {
            title: '类别',
            dataIndex: 'data1',
          },
          {
            title: '名称',
            dataIndex: 'data2',
          },
          {
            title: 'API地址',
            dataIndex: 'data3',
          },
          {
            title: '网络延迟',
            dataIndex: 'data4',
          },
          {
            title: '同步状态',
            dataIndex: 'data6',
          },
          {
            title: '',
            dataIndex: '_action',
            width: 200,
            render: () => (
              <ButtonGroup>
                <Button onClick={() => {}}>修改</Button>
                <Button
                  onClick={() => {
                    openModal({
                      name: 'DeleteApiModal',
                      data: {
                        title: '删除API',
                        callback: () => {},
                      },
                    });
                  }}>
                  删除
                </Button>
              </ButtonGroup>
            ),
          },
        ],
        widths
      ),
      dataSource: [
        {
          data1: '系统默认',
          data2: '本机私有',
          data3: 'ws://localhost:6789',
          data4: '1ms',
          data5: '5个',
          data6: '88.88%',
        },
      ],
    };
    return <Table {...tableProps} />;
  }
}

export default ApiManageTable;
