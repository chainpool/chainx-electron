import { default as Configure } from '../Configure';
import { PATH } from '../../constants';

import Trust from '../Trust';
import TrustGovern from '../TrustGovern';
import { lazy } from 'react';

export default [
  {
    title: 'AssetTrustee',
    path: PATH.trust,
    component: Trust,
    show: true,
  },
  {
    title: 'TrustGovern',
    show: false,
    path: PATH.trustGovern,
    component: TrustGovern,
  },
  {
    title: 'Configure',
    show: true,
    path: PATH.configure,
    component: Configure,
  },
];
