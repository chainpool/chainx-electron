import _ from 'lodash';
import moment from 'moment';
import store from 'store';
import { forkJoin, from, of, Subject, combineLatest, interval, never, empty } from 'rxjs';
import {
  mergeMap,
  mergeAll,
  map,
  race,
  retry,
  catchError,
  tap,
  take,
  share,
  debounceTime,
  takeWhile,
} from 'rxjs/operators';

export const lodash_helper = {
  sum: _.sum,
  invert: _.invert,
  findIndex: _.findIndex,
  groupBy: _.groupBy,
  toPairs: _.toPairs,
  isEqual: _.isEqual,
  map: _.map,
  orderBy: _.orderBy,
  debounce: _.debounce,
  maxBy: _.maxBy,
  isArray: _.isArray,
  merge: _.merge,
  isObject: _.isObject,
  isObjectLike: _.isObjectLike,
  keys: _.keys,
  values: _.values,
  has: _.has,
  get: _.get,
  set: _.set,
  isEmpty: _.isEmpty,
  isNull: _.isNull,
  isNaN: _.isNaN,
  isUndefined: _.isUndefined,
  isNumber: _.isNumber,
  isString: _.isString,
  cloneDeep: _.cloneDeep,
  uniqueId: _.uniqueId,
  isFunction: _.isFunction,
  find: _.find,
  random: _.random,
  shuffle: _.shuffle,
};

export const Rx = {
  interval,
  combineLatest,
  takeWhile,
  debounceTime,
  take,
  from,
  forkJoin,
  catchError,
  race,
  map,
  mergeMap,
  mergeAll,
  retry,
  tap,
  of,
  Subject,
  share,
  never,
  empty,
};

export const localSave = {
  get: key => {
    return store.get(key);
  },
  set: (key, value) => {
    store.set(key, value);
  },
  remove: key => {
    store.remove(key);
  },
  clearAll: () => {
    store.clearAll();
  },
  getUserInfo: () => {
    return store.get('userInfo');
  },
};

export const moment_helper = {
  format: (time = Date.now(), format = 'YYYY-MM-DD') => {
    return moment.utc(time).format(format);
  },
  formatHMS: (time = Date.now()) => {
    return moment(time).format('YYYY-MM-DD HH:mm:ss');
  },
  formatHMSFromSeconds: time => {
    return moment_helper.formatHMS(String(time).split('.')[0] * 1000);
  },
  getdays: (startTime, endTime, isInclude = false) => {
    const days = Math.ceil(moment.duration(endTime - startTime).asDays());
    const daysArray = [];
    for (let i = 0; i < days - 2; i++) {
      daysArray.push(startTime + (i + 1) * 1 * 24 * 60 * 60 * 1000);
    }
    return daysArray;
  },
  diff: (a, b = Date.now(), type = 'minutes') => Math.abs(moment(a).diff(b, type)),
};
