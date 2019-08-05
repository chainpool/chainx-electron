const WebSocket = require("ws");
const fetch = require("node-fetch");
let id = 0;
let id2 = 0;

function requestWs({ url, id, method, params }) {
  let startTime;
  let endTime;
  return new Promise((resolve, reject) => {
    const message = JSON.stringify({ id, jsonrpc: "2.0", method, params });
    const ws = new WebSocket(url);
    ws.onmessage = m => {
      try {
        const data = JSON.parse(m.data);
        if (data.id === id) {
          endTime = Date.now();
          resolve({
            data: data.result,
            wastTime: endTime - startTime
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

const fetchFromWs = ({ url, method, params = [], timeOut = 5000 }) => {
  id = id + 1;
  if (timeOut) {
    return Promise.race([
      requestWs({ url, method, params, id }),
      new Promise((resovle, reject) => {
        setTimeout(() => {
          reject("请求超时");
        }, timeOut);
      })
    ]);
  } else {
    return requestWs({ url, method, params, id });
  }
};

const fetchFromHttp = ({
  url,
  method = "POST",
  methodAlias,
  params = [],
  body,
  timeOut = 5000,
  header = {}
}) => {
  id2 = id2 + 1;
  const message = body
    ? JSON.stringify(body)
    : JSON.stringify({ id, jsonrpc: "2.0", method: methodAlias, params });
  const request = () =>
    fetch(url, {
      method: method,
      headers: {
        method,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...header
      },
      ...(method.toUpperCase() === "GET" ? {} : { body: message })
    })
      .then(async res => {
        try {
          if (res && res.status >= 200 && res.status < 300) {
            return res.json();
          } else {
            const result = await res.json();
            return Promise.reject({
              status: res.status,
              message: result
            });
          }
        } catch (e) {
          return Promise.reject({
            status: res.status,
            message: e.message
          });
        }
      })
      .catch(err => {
        return Promise.reject(err);
      });
  if (timeOut) {
    return Promise.race([
      request(),
      new Promise((resovle, reject) => {
        setTimeout(() => {
          reject("请求超时");
        }, timeOut);
      })
    ]);
  } else {
    return request();
  }
};

module.exports = {
  fetchFromWs,
  fetchFromHttp
};
