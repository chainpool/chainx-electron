import React, { Component } from 'react';
import * as styles from './index.less';
import { Button, ButtonGroup, FormattedMessage, Icon, Mixin, Table } from '../../components';
import { HoverTip } from '../components';
import { classNames } from '../../utils';

class ProposalSwitchTrustee extends Mixin {
  render() {
    const {
      model: { name },
    } = this.props;
    const tableProps = {
      className: styles.tableContainer,
      columns: [
        {
          title: '节点名',
          dataIndex: 'name',
        },
        {
          title: '节点地址',
          dataIndex: 'address',
        },
        {
          title: '热公钥',
          dataIndex: 'hotEntity',
        },
        {
          title: '冷公钥',
          dataIndex: 'coldEntity',
        },
      ],
      dataSource: [
        {
          name: 'buildlinks',
          address: 'wweeeeeeee',
          hotEntity: '123333',
          coldEntity: '12244fggyyy',
        },
      ],
    };

    const notResponseList = [];
    const totalSignCount = 4;
    const haveSignList = [];
    const maxSignCount = 4;

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
                        <ul className={styles.account}>{haveSignList.map((one, index) => renderSignLi(one, index))}</ul>
                      }>
                      {`${haveSignList.length}/${maxSignCount}`}
                    </HoverTip>
                  </span>
                </li>
              </ul>
              <ButtonGroup>
                <Button className={classNames(styles.signButton)} onClick={() => {}}>
                  签名
                </Button>
                <Button className={classNames(styles.refuseButton)}>删除</Button>
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
