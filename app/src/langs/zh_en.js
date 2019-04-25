const zh_en = {
  NewAccount: ['新增账户', 'new account'],
};

export const zh_CN = {};
Object.getOwnPropertyNames(zh_en).forEach(key => {
  zh_CN[key] = zh_en[key][0];
});

export const en_US = {};
Object.getOwnPropertyNames(zh_en).forEach(key => {
  en_US[key] = zh_en[key][1];
});
