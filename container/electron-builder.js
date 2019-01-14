module.exports = {
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
