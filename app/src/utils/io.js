import { default as io } from 'socket.io-client';
class Io {
  constructor() {
    this.socket = io.connect('http://localhost:3001');
    // io.on('connection', socket => {
    //   console.log('io已连接');
    //   this.socket.emit('subscribe', data => {
    //     console.log(data, '----data');
    //   });
    // });
  }
}

export default new Io();
