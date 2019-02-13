const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");
const util = require("util");

class KeystoreManager {
  constructor(dirPath = "~/Library/Application Support/ChainX/keystore") {
    // TODO: 根据不同系统设置不同的默认路径
    this.dirPath = path.join(dirPath, "keystore");
    this._encoding = "utf8";
    this._isReady = this._init();
  }

  _init() {
    return new Promise((resolve, reject) => {
      mkdirp(this.dirPath, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async save(keystoreObj, fileName, extendObj) {
    await this._isReady;

    const finalObj = extendObj ? { ...keystoreObj, ...extendObj } : keystoreObj;
    const filePath = path.join(this.dirPath, fileName);

    const writeFile = util.promisify(fs.writeFile);
    return writeFile(filePath, JSON.stringify(finalObj), this._encoding);
  }

  async getAllKeystore() {
    await this._isReady;

    return new Promise((resolve, reject) => {
      const keystores = [];
      try {
        fs.readdirSync(this.dirPath).forEach(filename => {
          const filePath = path.join(this.dirPath, filename);
          const stat = fs.statSync(filePath);
          if (!stat.isFile()) {
            return;
          }

          const content = fs.readFileSync(filePath, this._encoding);
          try {
            keystores.push(JSON.parse(content));
          } catch (e) {
            // TODO: 考虑如何处理, 原因用户可能随意放到该目录下一个任意格式的文件。
          }
        });
      } catch (e) {
        reject(e);
      }

      resolve(keystores);
    });
  }
}

module.exports = KeystoreManager;
