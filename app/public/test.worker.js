// Respond to message from parent thread
self.addEventListener('message', (event = {}) => {
  const { data: { encrypt, decoded, password, type } = {} } = event;
  // console.log(encrypt, '----');
  // if (type === 'bip38.encrypt') {
  //   const decodedHotPrivateKey = encrypt(decoded.privateKey, decoded.compressed, password);
  //   self.postMessage({ type: 'bip38.encrypt.result', decodedHotPrivateKey });
  // }
});
