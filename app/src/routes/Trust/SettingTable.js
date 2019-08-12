import React, { Component } from 'react';
import { Inject } from '../../utils';
import { FormattedMessage, Table } from '../../components';
import * as styles from './index.less';

@Inject(({ trustStore }) => ({ trustStore }))
class SettingTable extends Component {
  render() {
    const {
      trustStore: { trusts, openModal },
    } = this.props;

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'Chain'} />,
          dataIndex: 'chain',
          width: 100,
        },
        // {
        //   title: <FormattedMessage id={'NodeStatus'} />,
        //   dataIndex: 'connected',
        //   render: value => {
        //     switch (value) {
        //       case true:
        //         return <FormattedMessage id={'HaveLinked'} />;
        //       case false:
        //         return (
        //           <span className="red">
        //             <FormattedMessage id={'OverTime'} />
        //           </span>
        //         );
        //       default:
        //         return (
        //           <span className="red">
        //             <FormattedMessage id={'UnLinked'} />
        //           </span>
        //         );
        //     }
        //   },
        // },
        {
          title: <FormattedMessage id={'HotEntity'} />,
          ellipse: true,
          dataIndex: 'hotPubKey',
        },
        {
          title: <FormattedMessage id={'ColdEntity'} />,
          ellipse: 0,
          dataIndex: 'coldPubKey',
        },
      ],
      dataSource: trusts,
    };

    return <Table {...tableProps} />;
  }
}

export default SettingTable;
