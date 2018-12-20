import { lodash_helper, moment_helper, Rxjs_helper } from './helper';
import { observer, inject } from 'mobx-react';

//------------------通用部分
export { request } from './request';
export const _ = lodash_helper;
export const moment = moment_helper;
export { localSave } from './helper';
export const R = Rxjs_helper;

export const getRes = function(res) {
  if (res) {
    return {
      data: _.get(res, 'data') || res,
    };
  }
  return {
    data: null,
    head: null,
    code: (res && res.errcode) || '',
    msg: _.get(res, 'data.errormsg') || _.get(res, 'errStr'),
  };
};

export const resOk = res => {
  if (_.isNil(res.data)) {
    return false;
  }
  return true;
};

// ----------------------------项目适用
export { toJS, observable, action, runInAction } from 'mobx';

export const Inject = func => {
  return c => {
    return inject(func)(observer(c));
  };
};

export const processResult = (payload, callback = v => v) => {
  const data = getRes(payload);
  if (!_.isFunction(callback)) return console.error('callback必须是函数');
  if (resOk(data)) {
    return callback(data.data);
  }
};

export const createSubject = (type, callback) => {
  const sub$ = new R.Subject();
  return sub$;
};

export const formatJson = string => {
  if (_.isObjectLike(string)) return string;
  return JSON.parse(string);
};
