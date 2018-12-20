import React from 'react';
import { Mixin } from '../../components';
import { Inject } from '../../utils';
import ws2 from '../../services/socketClient2';
import * as styles from './index.less';
import { filter } from 'rxjs/operators';

@Inject(({ chatClub: model }) => ({ model }))
class ChatClub extends Mixin.Custom {
  state = {
    result: '',
    price: '',
    apple: '',
    banana: '',
  };

  startInit = () => {
    this.getPriceWs2();
    if (window.require) {
      const electron = window.require('electron');
      const { ipcRenderer } = electron;
      ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg, '=========================');
      });
      ipcRenderer.on('show', (event, arg) => {
        alert(arg);
      });
      ipcRenderer.send('me', 'ping');
    }
  };

  getPriceWs2 = () => {
    ws2
      .send({
        subscribe: 'apple',
      })
      .pipe(
        filter(v => {
          return v[1].apple;
        })
      )
      .subscribe(([e, data]) => {
        this.changeState({
          apple: data.apple,
        });
      });

    ws2
      .send({
        subscribe: 'banana',
      })
      .pipe(
        filter(v => {
          return v[1].banana;
        })
      )
      .subscribe(([e, data]) => {
        this.changeState({
          banana: data.banana,
        });
      });
  };

  render() {
    return (
      <div>
        <button
          onClick={() => {
            if (window.require) {
              const electron = window.require('electron');
              const { ipcRenderer } = electron;
              ipcRenderer.send('update', '更新');
            }
          }}>
          更新
        </button>
        <div className={styles.chatClub}>{this.state.result ? this.state.result : '没有数据是啥'}</div>
        <div>
          apple：{this.state.apple}
          <div />
          banana:{this.state.banana}
        </div>
      </div>
    );
  }
}

export default ChatClub;
