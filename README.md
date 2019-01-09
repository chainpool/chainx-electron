# App

### 使用 electron-updater 应用更新说明

- package.json 的 version 需要更新
- 打包结果需要需要把 app.exe,blobkmap,latestyml 三个文件同时放到服务器某个目录，app 的更新自动根据 package.json 的 publish 字段请求 latestyml 文件，比较更新

### package.json 说明

- 区分 dependencies 和 devDependencies,不在打包环境的 npm 包不要安装到 dependencies，前者用 npm install --save,后者用 npm i --save-dev 安装,electron 包比较特殊，被程序要求安装到后者

- 可能会遇到开发环境正常，打包时 npm 包报错，删除 nodul_modules 用 yarn 或 npm 重新安装即可

### postgresql 数据库连接 说明

- 第三方数据库采用免安装方式，后台静默启动
- windows 系统把官网 zip 文件放入/container/third-party 目录，包名需要添加到 Sql 类
