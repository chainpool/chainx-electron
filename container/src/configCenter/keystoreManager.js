const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');

class KeystoreManager {
  constructor(dirPath = '~/Library/Application Support/ChainX/keystore') {
    // TODO: 根据不同系统设置不同的默认路径
    this.dirPath = path.join(dirPath, 'keystore');
    this._encoding = 'utf8'
  }

  init() {
    return new Promise((resolve, reject) => {
      mkdirp(this.dirPath, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  save(keystoreObj, fileName, extendObj) {
    return new Promise((resolve, reject) => {
      const finalObj = extendObj ? { ...keystoreObj, ...extendObj } : keystoreObj;
      const filePath = path.join(this.dirPath, fileName);

      fs.writeFile(filePath, JSON.stringify(finalObj), this._encoding, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

  }

  getAllKeystore() {
    return new Promise((resolve, reject) => {
      const keystores = [];
      try {
        fs.readdirSync(this.dirPath).forEach(filename => {
          const filePath = path.join(this.dirPath, filename);
          const stat = fs.statSync(filePath);
          if (!stat.isFile()) {
            return
          }

          const content = fs.readFileSync(filePath, this._encoding);
          try {
            keystores.push(JSON.parse(content));
          } catch (e) {
            // TODO: 考虑如何处理, 原因用户可能随意放到该目录下一个任意格式的文件。
          }
        })
      } catch (e) {
        reject(e)
      }

      resolve(keystores)
    })
  }
}

export default KeystoreManager;
