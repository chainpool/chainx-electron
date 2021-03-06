import { default as Configure } from '../Configure';
import { PATH } from '../../constants';
import Asset from '../Asset';
import Mine from '../Mine';
import Election from '../Election';
import DepositWithDrawRecord from '../DepositWithDrawRecord';
import TradeRecord from '../TradeRecord';
import AddressManage from '../AddressManage';
import Trust from '../Trust';
import Trade from '../Trade';

export default [
  {
    title: 'Asset',
    path: PATH.asset,
    component: Asset,
    authority: [1],
  },
  {
    title: 'DepositsMining',
    path: PATH.mine,
    component: Mine,
  },
  {
    title: 'NominationsElections',
    path: PATH.election,
    notExact: true,
    component: Election,
  },
  {
    title: 'DepositWithdrawalRecords',
    show: false,
    path: PATH.depositWithdrawRecord,
    component: DepositWithDrawRecord,
    authority: [1],
  },
  {
    title: 'TradeRecord',
    show: false,
    path: PATH.tradeRecord,
    component: TradeRecord,
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
    // authority: [1],
  },
  {
    title: 'DEX',
    path: PATH.trade,
    component: Trade,
  },
  {
    title: 'DAPP',
    path: '/dapp',
    component: Trade,
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
