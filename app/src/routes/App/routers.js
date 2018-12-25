import { default as Asset } from '../Asset';
import { default as Election } from '../Election';
import { default as DepositWithDrawRecord } from '../DepositWithDrawRecord';
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
];
