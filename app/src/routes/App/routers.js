import { default as Configure } from '../Configure';
import { PATH } from '../../constants';
import { lazy } from 'react';

export default [
  {
    title: '资产',
    path: PATH.asset,
    component: lazy(() => import('../Asset')),
    authority: [1],
  },
  {
    title: '充值挖矿',
    path: PATH.mine,
    component: lazy(() => import('../Mine')),
  },
  {
    title: '投票选举',
    path: PATH.election,
    component: lazy(() => import('../Election')),
  },
  {
    title: '充提记录',
    show: false,
    path: PATH.depositWithdrawRecord,
    component: lazy(() => import('../DepositWithDrawRecord')),
    authority: [1],
  },
  {
    title: '交易记录',
    show: false,
    path: PATH.tradeRecord,
    component: lazy(() => import('../TradeRecord')),
    authority: [1],
  },
  {
    title: '地址管理',
    show: false,
    path: PATH.addressManage,
    component: lazy(() => import('../AddressManage')),
    authority: [1],
  },
  {
    title: '资产信托',
    path: PATH.trust,
    component: lazy(() => import('../Trust')),
    authority: [1],
    requireTrustee: true,
  },
  {
    title: '币币交易',
    path: PATH.trade,
    component: lazy(() => import('../Trade')),
  },
  {
    title: 'DAPP专区',
    path: '/dapp',
    component: lazy(() => import('../Trade')),
    status: 'awaiting',
    warn: '敬请期待',
  },
  {
    title: '配置',
    // show: true,
    path: PATH.configure,
    component: Configure,
  },
];
