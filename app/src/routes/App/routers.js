import { default as Configure } from '../Configure';
import { PATH } from '../../constants';
import { lazy } from 'react';

export default [
  {
    title: 'Asset',
    path: PATH.asset,
    component: lazy(() => import('../Asset')),
    authority: [1],
  },
  {
    title: 'DepositsMining',
    path: PATH.mine,
    component: lazy(() => import('../Mine')),
  },
  {
    title: 'NominationsElections',
    path: PATH.election,
    notExact: true,
    component: lazy(() => import('../Election')),
  },
  {
    title: 'DepositWithdrawalRecords',
    show: false,
    path: PATH.depositWithdrawRecord,
    component: lazy(() => import('../DepositWithDrawRecord')),
    authority: [1],
  },
  {
    title: 'TradeRecord',
    show: false,
    path: PATH.tradeRecord,
    component: lazy(() => import('../TradeRecord')),
    authority: [1],
  },
  {
    title: 'Contact',
    show: false,
    path: PATH.addressManage,
    component: lazy(() => import('../AddressManage')),
    authority: [1],
  },
  {
    title: 'AssetTrustee',
    path: PATH.trust,
    component: lazy(() => import('../Trust')),
    // authority: [1],
  },
  {
    title: 'DEX',
    path: PATH.trade,
    component: lazy(() => import('../Trade')),
  },
  {
    title: 'DAPP',
    path: '/dapp',
    component: lazy(() => import('../Trade')),
    status: 'awaiting',
    show: false,
    warn: 'ComingSoon',
  },
  {
    title: 'Configure',
    show: false,
    path: PATH.configure,
    component: Configure,
  },
];
