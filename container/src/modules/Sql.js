// 解压third-party数据库文件，并启动
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const unzip = require("unzip");
const os = require("os");
const {
  streamPromise,
  accessPromise,
  mkdirPromise,
  execPromise
} = require("../utils");

class Sql {
  constructor(config = {}) {
    this.config = {
      host: "127.0.0.1",
      port: 5432,
      database: "postgres",
      user: os.userInfo().username,
      password: "123456",
      ...config
    };
    this.baseDir = path.join(
      // "D:/myproject/electron_myapp/container/dist/app-1.0.2-win",
      process.cwd(),
      "resources/app.asar.unpacked/third-party"
    );
    this.sqlFile = "postgresql-10.5-1-windows-x64-binaries.zip";
    this.destDir = path.join(this.baseDir, "pgsql");
    this.dataBaseDir = path.join(this.baseDir, "myData");
    this.binDir = path.join(this.destDir, "bin");
    this.timeOut = 40000;
    this.init();
  }

  async init() {
    try {
      await accessPromise(this.binDir);
      this.connect();
    } catch (err) {
      try {
        await accessPromise(this.baseDir);
        try {
          await streamPromise(
            fs.createReadStream(path.join(this.baseDir, this.sqlFile)),
            unzip.Extract({ path: this.baseDir })
          );
          console.log("解压成功");
          this.workFlow();
        } catch (err) {
          return console.log("解压失败", err);
        }
      } catch (err) {
        console.log("文件结构不存在，处于开发模式");
      }
    }
  }

  async workFlow() {
    try {
      await mkdirPromise(this.dataBaseDir);
      console.log("myData目录创建成功");
      try {
        await execPromise(`initdb.exe -D ${this.dataBaseDir}`, {
          cwd: this.binDir,
          timeout: this.timeOut
        });
        console.log("数据库初始化成功");
        this.connect();
      } catch (err) {
        return console.log("数据库初始化失败", err);
      }
    } catch (err) {
      return console.log("myData目录创建失败", err);
    }
  }

  async connect() {
    const { config } = this;
    const pool = new Pool(config);
    try {
      await pool.connect();
      console.log("数据库连接成功");
    } catch (err) {
      console.log("数据库连接错误", err);
      this.startSql();
    }
  }

  async startSql() {
    try {
      await execPromise(`pg_ctl -D ${this.dataBaseDir} -l logfile start`, {
        cwd: this.binDir,
        timeout: 1000
      });
      console.log("数据库启动成功-----");
      this.connect();
    } catch (err) {
      return console.log("数据库启动错误", err);
    }
  }

  /*
  创建database与用户名
   */
  createDataBaseAndUser() {
    // const { host, database, user } = this.config;
    // child_process.exec(
    //   `createdb -h ${host} ${database}`,
    //   { cwd: this.binDir, timeout: 1000 },
    //   err => {
    //     if (err) {
    //       return console.log("数据库建表失败", err);
    //     }
    //     console.log("数据库建表成功");
    //     child_process.exec(
    //       `createuser -h ${host} ${user}`,
    //       { cwd: this.binDir, timeout: 1000 },
    //       err => {
    //         if (err) {
    //           return console.log("数据库创建用户失败", err);
    //         }
    //         console.log("数据库创建用户成功");
    //
    //       }
    //     );
    //   }
    // );
  }
}

module.exports = new Sql();
