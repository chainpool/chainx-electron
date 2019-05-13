import React, { Component } from 'react';
import { Button, ButtonGroup, Modal, Table, FormattedMessage } from '../../../components';
import * as styles from './UnFreezeModal.less';
import { formatNumber, Inject, moment_helper } from '../../../utils';

@Inject(({ chainStore }) => ({ chainStore }))
class UnFreezeModal extends Component {
  render() {
    const {
      model: { dispatch, openModal },
      chainStore: { blockNumber, blockDuration, blockTime },
      globalStore: {
        nativeAssetPrecision,
        modal: { data: { account = '', myRevocations = [] } = {} },
      },
    } = this.props;
    const normalizedRevocations = myRevocations.map(revocation => {
      return {
        canUnFreeze: revocation.revocationHeight <= blockNumber,
        amount: formatNumber.toPrecision(revocation.amount, nativeAssetPrecision),
        time: blockTime.getTime() + (revocation.revocationHeight - blockNumber) * blockDuration,
      };
    });

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: <FormattedMessage id={'FreezeBalance'} />,
          dataIndex: 'amount',
        },
        {
          title: () => (
            <span>
              <FormattedMessage id={'DeadTime'} />
              <span className={styles.desc}>
                (<FormattedMessage id={'predict'} />)
              </span>
            </span>
          ),
          dataIndex: 'time',
          render: v => {
            return moment_helper.formatHMS(v);
          },
        },

        {
          title: '',
          dataIndex: '_action',
          render: (value, item, index) => (
            <ButtonGroup>
              {/*TODO: 调整button样式*/}
              <Button
                type={item.canUnFreeze ? 'primary' : 'disabled'}
                onClick={() => {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [{ name: 'operation', value: () => <FormattedMessage id={'Unfreeze'} /> }],
                      callback: () => {
                        return dispatch({
                          type: 'unfreeze',
                          payload: {
                            target: account,
                            revocationIndex: index,
                          },
                        });
                      },
                    },
                  });
                }}>
                <FormattedMessage id={'Unfreeze'} />
              </Button>
            </ButtonGroup>
          ),
        },
      ],
      dataSource: normalizedRevocations,
    };

    return (
      <Modal title={<FormattedMessage id={'UnfreezeLocked'} />}>
        <div className={styles.unFreezeModal}>
          <Table {...tableProps} />
        </div>
      </Modal>
    );
  }
}

export default UnFreezeModal;
