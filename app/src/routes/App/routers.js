import { default as Asset } from '../Asset';
import { default as Election } from '../Election';
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
];
