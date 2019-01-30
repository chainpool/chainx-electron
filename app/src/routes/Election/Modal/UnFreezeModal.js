import React, { Component } from 'react';
import { Button, ButtonGroup, Modal, Table } from '../../../components';
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
          title: '冻结金额',
          dataIndex: 'amount',
        },
        {
          title: () => (
            <span>
              到期时间<span className={styles.desc}>(预估)</span>
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
                      description: [{ name: '操作', value: '解冻' }],
                      callback: ({ signer, acceleration }) => {
                        dispatch({
                          type: 'unfreeze',
                          payload: {
                            signer,
                            acceleration,
                            target: account,
                            revocationIndex: index,
                          },
                        });
                      },
                    },
                  });
                }}>
                解冻
              </Button>
            </ButtonGroup>
          ),
        },
      ],
      dataSource: normalizedRevocations,
    };

    return (
      <Modal title="赎回解冻">
        <div className={styles.unFreezeModal}>
          <Table {...tableProps} />
        </div>
      </Modal>
    );
  }
}

export default UnFreezeModal;
