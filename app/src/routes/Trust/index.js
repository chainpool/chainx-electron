import React from 'react';
import { Mixin, ButtonGroup, Button, Icon, FormattedMessage } from '../../components';
import { TableTitle } from '../components';
import { Inject } from '../../utils';
import SettingTable from './SettingTable';
import ImportHotPrivateKeyModal from './Modal/ImportHotPrivateKeyModal';
import NodeSettingModal from './Modal/NodeSettingModal';
import WithdrawTable from './WithdrawTable';
import WithdrawConstructModal from './Modal/WithdrawConstructModal';
import WithdrawSignModal from './Modal/WithdrawSignModal';
import TrustSetting from './Modal/TrustSettingModal';
import SignChannelSelectModal from './Modal/SignChannelSelectModal';
import SignResultModal from './Modal/SignResultModal';
import ConstructSpecialTradeModal from './Modal/ConstructSpecialTradeModal';
import AnalyzeSpecialTradeModal from './Modal/AnalyzeSpecialTradeModal';
import ExportHardwarePubKey from './Modal/ExportHardwarePubKey';
import ViewHardwarePubKey from './Modal/ViewHardwarePubKey';
import AfterSelectChannelModal from './Modal/AfterSelectChannelModal';
import NormalResponseList from './NormalResponseList';
import * as styles from './index.less';

@Inject(({ trustStore: model, accountStore, assetStore }) => ({ model, accountStore, assetStore }))
class Trust extends Mixin {
  startInit = () => {
    this.fetchPoll(this.getAllWithdrawalList);
    this.fetchPoll(this.getSign);
    this.getSomeOneInfo();
    this.getMinimalWithdrawalValueByToken();
    // this.props.model.openModal({
    //   name: 'ViewHardwarePubKey',
    // });
  };

  getAllWithdrawalList = async () => {
    const {
      model: { dispatch },
    } = this.props;
    this.subscribeAllWithdrawalList$ = await dispatch({ type: 'getAllWithdrawalList' });
  };

  getSomeOneInfo = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getSomeOneInfo',
    });
  };

  getMinimalWithdrawalValueByToken = () => {
    const {
      model: { dispatch },
    } = this.props;
    return dispatch({
      type: 'getMinimalWithdrawalValueByToken',
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

  componentWillUnsubscribe = () => {
    this.subscribeAllWithdrawalList$.unsubscribe();
  };

  render() {
    const {
      accountStore: {
        isValidator,
        isTrustee,
        isActiveValidator,
        openModal,
        currentAccount: { address },
      },
      globalStore: {
        modal: { name },
      },
      model: { trusts = [], normalizedOnChainAllWithdrawList = [] },
    } = this.props;
    const currentTrustNode =
      trusts.filter((item = {}) => item.chain === 'Bitcoin' && address === item.address)[0] || {};
    const props = {
      ...this.props,
      currentTrustNode,
    };

    const isShowConstructureWithdraw =
      isTrustee &&
      normalizedOnChainAllWithdrawList.filter((item = {}) => {
        return item.status.value.toUpperCase() === 'SIGNING' || item.status.value === 'PROCESSING';
      }).length === 0 &&
      normalizedOnChainAllWithdrawList.filter((item = {}) => item.status.value.toUpperCase() === 'APPLYING').length > 0;

    return (
      <div className={styles.trust}>
        {isValidator && (
          <div className={styles.setting}>
            <TableTitle title={<FormattedMessage id={'TrusteeSettings'} />} className={styles.title}>
              <span className={styles.nodeStyle}>
                (<FormattedMessage id={'YouAre'} />：
                {isTrustee ? (
                  <FormattedMessage id={'TrusteeNode'} />
                ) : isActiveValidator ? (
                  <FormattedMessage id={'ValidatorNode'} />
                ) : (
                  <FormattedMessage id={'StandbyNode'} />
                )}
                )
              </span>
              <div className={styles.setListbutton}>
                <Button
                  type="blank"
                  onClick={() => {
                    openModal({ name: 'TrustSetting' });
                  }}>
                  <Icon name="icon-shezhixintuo" />
                  <span>
                    <FormattedMessage id={'SetupTrustee'} />
                  </span>
                </Button>
                <div className={styles.utils}>
                  <Icon name="xintuogongju" />
                  信托工具
                  <div className={styles.utilsContainer}>
                    <ul>
                      <li
                        type="blank"
                        onClick={() => {
                          openModal({ name: 'ExportHardwarePubKey' });
                        }}>
                        <Icon name="daochugongyue" />
                        <span>导出硬件公钥</span>
                      </li>
                      <li
                        type="blank"
                        onClick={() => {
                          openModal({ name: 'ConstructSpecialTradeModal' });
                        }}>
                        <Icon name="gouzaoteshujiaoyi" />
                        <span>构造特殊交易</span>
                      </li>
                      <li
                        type="blank"
                        onClick={() => {
                          openModal({ name: 'AnalyzeSpecialTradeModal' });
                        }}>
                        <Icon name="jiexi" />
                        <span>解析特殊交易</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TableTitle>
            <SettingTable {...this.props} />
          </div>
        )}
        <NormalResponseList {...this.props} />

        <div className={styles.withdraw}>
          <TableTitle title={<FormattedMessage id={'WithdrawalList'} />} className={styles.withdrawTitle}>
            <ButtonGroup>
              {isTrustee ? (
                <Button
                  {...(isShowConstructureWithdraw ? {} : { type: 'disabeld' })}
                  onClick={() => {
                    openModal({ name: 'WithdrawConstructModal' });
                  }}>
                  <Icon name="icon-goujiantixian" />
                  <FormattedMessage id={'BuildMultiSigWithdrawal'} />
                </Button>
              ) : null}
            </ButtonGroup>
          </TableTitle>
          <WithdrawTable {...props} />
        </div>
        {name === 'ImportHotPrivateKeyModal' ? <ImportHotPrivateKeyModal {...props} /> : null}
        {name === 'NodeSettingModal' ? <NodeSettingModal {...props} /> : null}
        {name === 'WithdrawConstructModal' ? <WithdrawConstructModal {...props} /> : null}
        {name === 'WithdrawSignModal' ? <WithdrawSignModal {...props} /> : null}
        {name === 'TrustSetting' ? <TrustSetting {...props} /> : null}
        {name === 'SignChannelSelectModal' ? <SignChannelSelectModal {...props} /> : null}
        {name === 'SignResultModal' ? <SignResultModal {...props} /> : null}
        {name === 'ConstructSpecialTradeModal' ? <ConstructSpecialTradeModal {...props} /> : null}
        {name === 'AnalyzeSpecialTradeModal' ? <AnalyzeSpecialTradeModal {...props} /> : null}
        {name === 'ExportHardwarePubKey' ? <ExportHardwarePubKey {...props} /> : null}
        {name === 'ViewHardwarePubKey' ? <ViewHardwarePubKey {...props} /> : null}
        {name === 'AfterSelectChannelModal' ? <AfterSelectChannelModal {...props} /> : null}
      </div>
    );
  }
}

export default Trust;
