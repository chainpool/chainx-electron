#!/usr/bin/env node

const OSS = require('ali-oss');
const path = require('path');
const pkg = require('../package.json');
const fs = require('fs');

const version = pkg.version;
const productName = pkg.productName;

const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCCESS_KEY_SECRET,
  bucket: 'chainx-wallet-trustee',
});

const needUploadFiles = [
  path.resolve(__dirname, `../dist/${productName}-${version}.dmg`),
  path.resolve(__dirname, `../dist/${productName}-${version}-win.zip`),
  path.resolve(__dirname, `../dist/${productName}-${version}-x86_64.AppImage`),
];

async function put(targetDir, localPath) {
  const filename = path.basename(localPath);

  try {
    let result = await client.put(`${targetDir}/${filename}`, localPath);
    console.log(result.url);
  } catch (e) {
    console.log(e);
  }
}

async function putAll() {
  for (const filePath of needUploadFiles) {
    if (fs.existsSync(filePath)) {
      await put(version, filePath);
    }
  }
}

putAll();
