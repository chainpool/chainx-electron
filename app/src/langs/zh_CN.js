import zh_en from './zh_en';
let zh_CN = {};
Object.getOwnPropertyNames(zh_en).forEach(key => {
  let keys = zh_en[key].split(' ');
  keys = keys.map(item => item.toUpperCase());
  zh_CN[keys.join('')] = key;
});
export default zh_CN;
