const EventEmitter = require('events');
const { spawn } = require('child_process');
const appRootDir = require('app-root-dir');
const os = require('os');
const path = require('path');
const isDev = require('electron-is-dev');

class ChainxNodeManager extends EventEmitter {
  constructor() {
    super()

    const rootDir = appRootDir.get();

    if (isDev) {
      this.nodeBinPath = path.join(rootDir, 'third-party', 'chainx-bin', `chainx-${os.platform()}`);
    } else {
      this.nodeBinPath = path.join(rootDir, '..', 'third-party', 'chainx-bin', `chainx-${os.platform()}`)
    }
  }

  startNode() {
    // TODO: 根据APP的配置构造args
    const args = [
      '--dev',
    ]

    this._process = spawn(this.nodeBinPath, args);

    this._process.once('error', error => {
      /**
       * TODO: 考虑如何处理chainx node出现error的情况
       * 1. 程序可能因端口占用等原因无法正常启动
       * 2. 程序运行时错误
       */
    });

    this._process.once('close', code => {
      // 程序可能因某种原因退出，应通知上层应用
      this.emit('chainx-close', code);
    });

    this._process.stdout.on('data', data => {
      // TODO: 考虑log
      this.emit('data', data);
    });

    this._process.stderr.on('data', data => {
      // TODO: 考虑log
      this.emit('data', data);
    });
  }

  stopNode() {
    if (!this._process) {
      return
    }

    this._process.stderr.removeAllListeners('data');
    this._process.stdout.removeAllListeners('data');
    this._process.removeAllListeners('error');

    this._process.kill('SIGINT');

    // after some time just kill it if not already done so
    const killTimeout = setTimeout(() => {
      if (this._process) {
        this._process.kill('SIGKILL');
      }
    }, 8000 /* 8 seconds */);

    this._process.once('close', () => {
      clearTimeout(killTimeout);
      this._process = null;
    });
  }
}

module.exports = ChainxNodeManager;
