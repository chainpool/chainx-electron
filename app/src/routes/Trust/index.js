import React from 'react';
import { Button, ButtonGroup, FormattedMessage, Icon, Mixin } from '../../components';
import { HoverTip, TableTitle } from '../components';
import { Inject } from '../../utils';
import WithdrawTable from './WithdrawTable';
import UpdateNodeModal from '../Election/Modal/UpdateNodeModal';
import RegisterNodeModal from '../Election/Modal/RegisterNodeModal';

import * as styles from './index.less';

@Inject(({ trustStore: model, accountStore, assetStore }) => ({ model, accountStore, assetStore }))
class Trust extends Mixin {
  startInit = () => {
    this.fetchPoll(this.getAllWithdrawalList);
  };

  getAllWithdrawalList = async () => {
    const {
      model: { dispatch },
    } = this.props;
    await dispatch({ type: 'getAllWithdrawalList' });
  };

  getSomeOneInfo = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getSomeOneInfo',
    });
  };

  getSign = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getWithdrawTx',
    });
  };

  render() {
    const {
      accountStore: {
        isValidator,
        openModal,
        currentAccount: { address },
      },
      globalStore: {
        modal: { name },
      },
      model: { trusts = [] },
    } = this.props;
    const currentTrustNode =
      trusts.filter((item = {}) => item.chain === 'Bitcoin' && address === item.address)[0] || {};
    const props = {
      ...this.props,
      currentTrustNode,
    };

    return (
      <div className={styles.trust}>
        <div className={styles.withdraw}>
          <TableTitle title={<FormattedMessage id={'WithdrawalList'} />} className={styles.withdrawTitle}>
            <ButtonGroup className={styles.groups}>
              {isValidator ? (
                <Button
                  type="blank"
                  onClick={() => {
                    openModal({
                      name: 'UpdateNodeModal',
                    });
                  }}>
                  <Icon name="icon-xiugaipeizhi" />
                  <FormattedMessage id={'UpdateNodeTip'}>
                    {msg => (
                      <HoverTip tip={msg}>
                        <FormattedMessage id={'UpdateNode'} />
                      </HoverTip>
                    )}
                  </FormattedMessage>
                </Button>
              ) : (
                <Button
                  type="blank"
                  onClick={() => {
                    openModal({
                      name: 'RegisterNodeModal',
                    });
                  }}>
                  <Icon name="icon-xiugaipeizhi" />
                  <HoverTip tip="注册并成功部署后，即可参与验证节点选举">
                    <FormattedMessage id={'RegisterNode'} />
                  </HoverTip>
                </Button>
              )}
            </ButtonGroup>
          </TableTitle>
          <WithdrawTable {...props} />
        </div>
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'RegisterNodeModal' ? <RegisterNodeModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Trust;
