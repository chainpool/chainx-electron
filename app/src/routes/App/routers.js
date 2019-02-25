import { default as Asset } from '../Asset';
import { default as Mine } from '../Mine';
import { default as Election } from '../Election';
import { default as DepositWithDrawRecord } from '../DepositWithDrawRecord';
import { default as TradeRecord } from '../TradeRecord';
import { default as AddressManage } from '../AddressManage';
import { default as Trade } from '../Trade';
import { default as Configure } from '../Configure';
import { default as Trust } from '../Trust';
import { PATH } from '../../constants';
export default [
  {
    title: '资产',
    path: PATH.asset,
    component: Asset,
    authority: [1],
  },
  {
    title: '充值挖矿',
    path: PATH.mine,
    component: Mine,
  },
  {
    title: '投票选举',
    path: PATH.election,
    component: Election,
  },
  {
    title: '充提记录',
    show: false,
    path: PATH.depositWithdrawRecord,
    component: DepositWithDrawRecord,
    authority: [1],
  },
  {
    title: '交易记录',
    show: false,
    path: PATH.tradeRecord,
    component: TradeRecord,
    authority: [1],
  },
  {
    title: '地址管理',
    show: false,
    path: PATH.addressManage,
    component: AddressManage,
    authority: [1],
  },
  {
    title: '资产信托',
    path: PATH.trust,
    component: Trust,
    authority: [1],
    requireTrustee: true,
  },
  {
    title: '币币交易',
    path: PATH.trade,
    component: Trade,
  },
  {
    title: 'DAPP专区',
    path: '/dapp',
    component: Trade,
    status: 'awaiting',
    warn: '敬请期待',
  },
  {
    title: '配置',
    show: false,
    path: PATH.configure,
    component: Configure,
  },
];
