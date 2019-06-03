const WebSocket = require('ws');
let id = 0;

function request({ url, id, method, params }) {
  let startTime;
  let endTime;
  return new Promise((resolve, reject) => {
    const message = JSON.stringify({ id, jsonrpc: '2.0', method, params });
    const ws = new WebSocket(url);
    ws.onmessage = m => {
      try {
        const data = JSON.parse(m.data);
        if (data.id === id) {
          endTime = Date.now();
          resolve({
            data: data.result,
            wastTime: endTime - startTime,
          });
          ws.close();
        }
      } catch (err) {
        reject(err);
      }
    };
    ws.onopen = () => {
      startTime = Date.now();
      ws.send(message);
    };
    ws.onerror = err => {
      ws.close();
      reject(err);
    };
  });
}

module.exports.fetchFromWs = ({ url, method, params = [], timeOut = 5000 }) => {
  id = id + 1;
  if (timeOut) {
    return Promise.race([
      request({ url, method, params, id }),
      new Promise((resovle, reject) => {
        setTimeout(() => {
          reject('请求超时');
        }, timeOut);
      }),
    ]);
  } else {
    return request({ url, method, params, id });
  }
};
