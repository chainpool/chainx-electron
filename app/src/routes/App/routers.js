import { default as Configure } from '../Configure';
import { PATH } from '../../constants';

import DepositWithDrawRecord from '../DepositWithDrawRecord';
import AddressManage from '../AddressManage';
import Trust from '../Trust';
import TrustGovern from '../TrustGovern';
import { lazy } from 'react';

export default [
  {
    title: 'DepositWithdrawalRecords',
    show: false,
    path: PATH.depositWithdrawRecord,
    component: DepositWithDrawRecord,
    authority: [1],
  },

  {
    title: 'Contact',
    show: false,
    path: PATH.addressManage,
    component: AddressManage,
    authority: [1],
  },
  {
    title: 'AssetTrustee',
    path: PATH.trust,
    component: Trust,
  },
  {
    title: 'TrustGovern',
    show: false,
    path: PATH.trustGovern,
    component: TrustGovern,
  },
  {
    title: 'Configure',
    show: false,
    path: PATH.configure,
    component: Configure,
  },
];
