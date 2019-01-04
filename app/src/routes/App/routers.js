import { default as Asset } from '../Asset';
import { default as Election } from '../Election';
import { default as DepositWithDrawRecord } from '../DepositWithDrawRecord';
import { default as OperationRecord } from '../OperationRecord';
import { default as AddressManage } from '../AddressManage';
import { default as Trade } from '../Trade';
import { default as Configure } from '../Configure';
import { PATH } from '../../constants';
export default [
  {
    title: '资产',
    path: PATH.asset,
    component: Asset,
  },
  {
    title: '选举',
    path: PATH.election,
    component: Election,
  },
  {
    title: '充提记录',
    show: false,
    path: PATH.depositWithdrawRecord,
    component: DepositWithDrawRecord,
  },
  {
    title: '操作记录',
    show: false,
    path: PATH.operationRecord,
    component: OperationRecord,
  },
  {
    title: '地址管理',
    show: false,
    path: PATH.addressManage,
    component: AddressManage,
  },
  {
    title: '交易',
    path: PATH.trade,
    component: Trade,
  },
  {
    title: '配置',
    show: false,
    path: PATH.configure,
    component: Configure,
  },
];
