import { lodash_helper, moment_helper } from './helper';
import { observer, inject } from 'mobx-react';

//------------------通用部分
export { request } from './request';
export const _ = lodash_helper;
export const moment = moment_helper;
export { localSave } from './helper';
export { default as classNames } from 'classnames';

// ----------------------------项目适用
export { toJS, observable, action, runInAction } from 'mobx';

export const Inject = func => {
  return c => {
    return inject(func)(observer(c));
  };
};
