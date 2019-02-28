import { default as store } from '../store';
import { default as Chainx } from 'chainx.js';
export const ChainX = new Chainx(process.env.CHAINX_NODE_URL || 'ws://127.0.0.1:9944');
