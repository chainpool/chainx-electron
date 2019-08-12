import React from 'react';
import { Button, ButtonGroup, FormattedMessage, Icon, Mixin, RouterGo } from '../../components';
import { HoverTip, TableTitle } from '../components';
import { ForceTrustee, PATH, ShowTrusteeSwitch } from '../../constants';
import { classNames, Inject } from '../../utils';
import SettingTable from './SettingTable';
import NodeSettingModal from './Modal/NodeSettingModal';
import WithdrawTable from './WithdrawTable';
import WithdrawConstructModal from './Modal/WithdrawConstructModal';
import TrustSetting from './Modal/TrustSettingModal';
import SignChannelSelectModal from './Modal/SignChannelSelectModal';
import SignResultModal from './Modal/SignResultModal';
import ConstructSpecialTradeModal from './Modal/ConstructSpecialTradeModal';
import AnalyzeSpecialTradeModal from './Modal/AnalyzeSpecialTradeModal';
import ExportHardwarePubKey from './Modal/ExportHardwarePubKey';
import ViewHardwarePubKey from './Modal/ViewHardwarePubKey';
import AfterSelectChannelModal from './Modal/AfterSelectChannelModal';
import TrezorPasswordModal from './Modal/TrezorPasswordModal';
import ResponseList from './ResponseList';
import UpdateNodeModal from '../Election/Modal/UpdateNodeModal';
import RegisterNodeModal from '../Election/Modal/RegisterNodeModal';
import APINodeSettingModal from './Modal/APINodeSettingModal';

import * as styles from './index.less';

@Inject(({ trustStore: model, accountStore, assetStore }) => ({ model, accountStore, assetStore }))
class Trust extends Mixin {
  startInit = () => {
    this.fetchPoll(this.getAllWithdrawalList);
    this.fetchPoll(this.getSign);
    this.getSomeOneInfo();
    this.getMinimalWithdrawalValueByToken();
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
        isValidator: _isValidator,
        isTrustee: _isTrustee,
        isActiveValidator,
        openModal,
        currentAccount: { address },
      },
      globalStore: {
        modal: { name },
      },
      model: { trusts = [], tx },
    } = this.props;
    const isTrustee = ForceTrustee ? true : _isValidator;
    const isValidator = ForceTrustee ? true : _isTrustee;
    const currentTrustNode =
      trusts.filter((item = {}) => item.chain === 'Bitcoin' && address === item.address)[0] || {};
    const props = {
      ...this.props,
      currentTrustNode,
    };

    const isShowConstructureWithdraw = isTrustee && !tx && currentTrustNode.apiNode;

    return (
      <div className={styles.trust}>
        {isValidator && (
          <div className={styles.setting}>
            <TableTitle title={<FormattedMessage id={'TrusteeSettings'} />} className={styles.title}>
              <span className={styles.nodeStyle}>
                {/*(<FormattedMessage id={'YouAre'} />：*/}
                {/*{_isTrustee ? (*/}
                {/*<FormattedMessage id={'TrusteeNode'} />*/}
                {/*) : isActiveValidator ? (*/}
                {/*<FormattedMessage id={'ValidatorNode'} />*/}
                {/*) : (*/}
                {/*<FormattedMessage id={'StandbyNode'} />*/}
                {/*)}*/}
                {/*)*/}
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
                {ShowTrusteeSwitch && (
                  <Button>
                    <RouterGo type="blank" go={{ pathname: PATH.trustGovern }}>
                      <Icon name="icon-shezhixintuo" />
                      <span>信托治理</span>
                    </RouterGo>
                  </Button>
                )}

                <div className={styles.utils}>
                  <span className={classNames(styles.trustutils)}>
                    <Icon name="xintuogongju" />
                    信托工具
                  </span>
                  {
                    <div className={styles.utilsContainer}>
                      <ul>
                        <li
                          type="blank"
                          onClick={() => {
                            openModal({
                              name: 'APINodeSettingModal',
                              data: {
                                chain: 'Bitcoin',
                                node: currentTrustNode.apiNode,
                              },
                            });
                          }}>
                          <Icon name="shezhiquanjiedian" />
                          <span>设置跨链节点</span>
                        </li>

                        {currentTrustNode.apiNode || ForceTrustee ? (
                          <>
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
                          </>
                        ) : null}
                      </ul>
                    </div>
                  }
                </div>
              </div>
            </TableTitle>
            <SettingTable {...this.props} />
          </div>
        )}

        <ResponseList {...this.props} isSpecialModel />
        <ResponseList {...this.props} isNormalModel />

        <div className={styles.withdraw}>
          <TableTitle title={<FormattedMessage id={'WithdrawalList'} />} className={styles.withdrawTitle}>
            <ButtonGroup className={styles.groups}>
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
              {_isValidator ? (
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
        {name === 'NodeSettingModal' ? <NodeSettingModal {...props} /> : null}
        {name === 'WithdrawConstructModal' ? <WithdrawConstructModal {...props} /> : null}
        {name === 'TrustSetting' ? <TrustSetting {...props} /> : null}
        {name === 'SignChannelSelectModal' ? <SignChannelSelectModal {...props} /> : null}
        {name === 'SignResultModal' ? <SignResultModal {...props} /> : null}
        {name === 'ConstructSpecialTradeModal' ? <ConstructSpecialTradeModal {...props} /> : null}
        {name === 'AnalyzeSpecialTradeModal' ? <AnalyzeSpecialTradeModal {...props} /> : null}
        {name === 'ExportHardwarePubKey' ? <ExportHardwarePubKey {...props} /> : null}
        {name === 'ViewHardwarePubKey' ? <ViewHardwarePubKey {...props} /> : null}
        {name === 'AfterSelectChannelModal' ? <AfterSelectChannelModal {...props} /> : null}
        {name === 'TrezorPasswordModal' ? <TrezorPasswordModal {...props} /> : null}
        {name === 'UpdateNodeModal' ? <UpdateNodeModal {...this.props} /> : null}
        {name === 'RegisterNodeModal' ? <RegisterNodeModal {...this.props} /> : null}
        {name === 'APINodeSettingModal' ? <APINodeSettingModal {...this.props} /> : null}
      </div>
    );
  }
}

export default Trust;
