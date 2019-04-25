import zh_en from './zh_en';
let en_US = {};
Object.getOwnPropertyNames(zh_en).forEach(key => {
  let keys = zh_en[key].split(' ');
  keys = keys.map(item => item.toUpperCase());
  en_US[keys.join('')] = zh_en[key];
});
export default en_US;
