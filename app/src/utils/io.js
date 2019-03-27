import { default as io } from 'socket.io-client';
class Io {
  constructor() {
    this.socket = io.connect('http://localhost:3001');
    this.socket.on('connect', () => {
      console.log('io已连接');
      this.socket.emit('subscribe', 'LATEST_KLINE_ROOM', 0, 86400, () => {
        console.log('订阅成功');
      });
      this.socket.on('latestKline_0_86400', data => {
        console.log(data, '---------------data');
      });
    });
  }
}

export default new Io();
