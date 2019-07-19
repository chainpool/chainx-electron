import React, { Component } from 'react';
import { Button, ButtonGroup, Modal, Table, FormattedMessage } from '../../../components';
import * as styles from './UnFreezeModal.less';
import { formatNumber, Inject, moment_helper, classNames } from '../../../utils';

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
        revocationHeight: revocation.revocationHeight,
        canUnFreeze: revocation.revocationHeight <= blockNumber,
        amount: formatNumber.toPrecision(revocation.amount, nativeAssetPrecision),
        time: blockTime.getTime() + (revocation.revocationHeight - blockNumber) * blockDuration,
      };
    });

    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          width: 150,
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
          render: (v, item) => {
            return (
              <span>
                <FormattedMessage id={'BlockHeight'} /> {item.revocationHeight}
                <span className={classNames(styles.blockHeight, item.canUnFreeze ? styles.unLock : null)}>
                  ({item.canUnFreeze ? <FormattedMessage id={'HasExpired'} /> : moment_helper.formatHMS(v)} )
                </span>
              </span>
            );
          },
        },

        {
          title: '',
          width: 100,
          dataIndex: '_action',
          render: (value, item, index) => (
            <ButtonGroup>
              <Button
                type={item.canUnFreeze ? 'confirm' : 'disabled'}
                onClick={() => {
                  openModal({
                    name: 'SignModal',
                    data: {
                      description: [{ name: 'operation', value: () => <FormattedMessage id={'Unfreeze'} /> }],
                      checkNativeAsset: (accountNativeAssetFreeBalance, fee, minValue) => {
                        if (minValue === 0) {
                          return accountNativeAssetFreeBalance - fee >= minValue;
                        } else {
                          return Number(accountNativeAssetFreeBalance - fee) + Number(item.amount) > minValue;
                        }
                      },
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
