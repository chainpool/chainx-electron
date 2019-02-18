import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { configure } from 'mobx';
import App from '@routes/App';
import { default as store } from './store';
import './index.less';
import 'whatwg-fetch';

// 不允许在动作外部修改状态
configure({ enforceActions: 'always' });

ReactDOM.render(
  <Provider {...store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
