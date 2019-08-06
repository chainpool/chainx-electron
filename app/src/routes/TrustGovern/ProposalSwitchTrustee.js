import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, FormattedMessage, Icon, Mixin, Table } from '../../components';
import { HoverTip } from '../components';
import { classNames, observer } from '../../utils';

@observer
class ProposalSwitchTrustee extends Mixin {
  render() {
    const {
      model: {
        proposalTrusteeList,
        proposalTotalSignCount,
        proposalMaxSignCount,
        normalizedTrusteeProposal = {},
        dispatch,
        openModal,
        getCurrentAccount,
      },
      electionStore: { trustIntentions: trustIntentions_prev },
    } = this.props;
    const trustIntentions = trustIntentions_prev.slice();
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '节点名',
          dataIndex: 'name',
          width: 100,
        },
        {
          title: '节点地址',
          dataIndex: 'addr',
          ellipse: 20,
        },
        {
          title: '热公钥',
          dataIndex: 'hotEntity',
          ellipse: 20,
        },
        {
          title: '冷公钥',
          dataIndex: 'coldEntity',
          ellipse: 0,
        },
      ],
      dataSource: normalizedTrusteeProposal.newTrustees,
    };

    const notResponseList = proposalTrusteeList.filter(item => !item.trusteeSign);
    const totalSignCount = proposalTotalSignCount;
    const haveSignList = proposalTrusteeList.filter(item => item.trusteeSign);
    const maxSignCount = proposalMaxSignCount;

    const canSign = () => {
      const currentAccount = getCurrentAccount();
      return (
        !haveSignList.find(item => item.isSelf && item.trusteeSign) &&
        trustIntentions.find(item => item.address === currentAccount.address)
      );
    };

    const renderSignLi = (one, index) => {
      return (
        <li key={index}>
          {one.name}
          {one.isHotEntity ? <span>(热)</span> : one.isColdEntity ? <span>(冷)</span> : null}
          {one.isSelf && (
            <>
              (<FormattedMessage id={'Self'} />)
            </>
          )}
        </li>
      );
    };
    return (
      <div className={styles.ProposalSwitchTrustee}>
        <div className={styles.signList}>
          <div className={styles.signStatus}>
            <div className={styles.reslist}>
              <div className={styles.left}>
                <ul className={styles.statusList}>
                  <li className={styles.notdealwith}>
                    <Icon name="weixiangying" className={'yellow'} />
                    <span>
                      <FormattedMessage id={'NoResponseSign'} />
                    </span>
                    <span className={styles.count}>
                      <HoverTip
                        width={550}
                        className={styles.hoverTrusteeList}
                        tip={
                          <ul className={styles.account}>
                            {notResponseList.map((one, index) => renderSignLi(one, index))}
                          </ul>
                        }>
                        {notResponseList.length}/{totalSignCount}
                      </HoverTip>
                    </span>
                  </li>
                  <li>
                    <Icon name="icon-wancheng" className={'green'} />
                    <span>
                      <FormattedMessage id={'HaveSigned'} />
                    </span>
                    <span className={styles.count}>
                      <HoverTip
                        width={550}
                        className={styles.hoverTrusteeList}
                        tip={
                          <ul className={styles.account}>
                            {haveSignList.map((one, index) => renderSignLi(one, index))}
                          </ul>
                        }>
                        {`${haveSignList.length}/${maxSignCount}`}
                      </HoverTip>
                    </span>
                  </li>
                </ul>
                <div className={styles.proposalId}>Proposal ID：{normalizedTrusteeProposal.proposalId}</div>
              </div>
              <ButtonGroup>
                {canSign() ? (
                  <Button
                    className={classNames(styles.signButton)}
                    onClick={() => {
                      openModal({
                        name: 'SignModal',
                        data: {
                          description: [{ name: 'operation', value: '签名 ' }],
                          callback: () => {
                            return dispatch({
                              type: 'trusteeGovernSign',
                            });
                          },
                        },
                      });
                    }}>
                    签名
                  </Button>
                ) : (
                  <Button type={'disabled'}>签名</Button>
                )}

                <Button
                  className={classNames(styles.refuseButton)}
                  onClick={() => {
                    openModal({
                      name: 'SignModal',
                      data: {
                        description: [{ name: 'operation', value: '删除 ' }],
                        callback: () => {
                          return dispatch({
                            type: 'removeMultiSign',
                          });
                        },
                      },
                    });
                  }}>
                  删除
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
        <div className={styles.tableBorder}>
          <Table {...tableProps} />
        </div>
      </div>
    );
  }
}

export default ProposalSwitchTrustee;
