const os = require('os');

const config = {
  "appId": "org.chainx.wallet",
  "asarUnpack": [
    "third-party/**/*"
  ],
  "files": [
    "**/*",
  ],
  "win": {
    "target": [
      "nsis",
      "zip"
    ]
  },
  "mac": {
    "category": "finance"
  },
  "publish": [
    {
      "provider": "generic",
      "url": "http://localhost:7000/electron_update/"
    }
  ]
}

switch (os.platform()) {
  case 'darwin':
    config.files.push('!third-party/**/*-linux', '!third-party/**/*-win32');
    break;
  case 'linux':
    config.files.push('!third-party/**/*-darwin', '!third-party/**/*-win32')
    break;
  case 'win32':
    config.files.push('!third-party/**/*-darwin', '!third-party/**/*-linux')
    break;
  default:
    config.files.push('!third-party/**/*')
}

module.exports = config
