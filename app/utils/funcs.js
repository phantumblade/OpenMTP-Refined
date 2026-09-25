import { isObject } from 'nice-utils';
import semver from 'semver';
import { APP_TITLEBAR_DOM_ID } from '../constants/dom';
import { APP_VERSION } from '../constants/meta';

export const isArraysEqual = (a, b) => {
  if (a === b) {
    return true;
  }

  if (a == null || b == null) {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};

export const isInt = (n) => {
  if (typeof n !== 'number') {
    return false;
  }

  return Number(n) === n && n % 1 === 0;
};

export const isFloat = (n) => {
  if (typeof n !== 'number') {
    return false;
  }

  return Number(n) === n && n % 1 !== 0;
};

export const isNumber = (n) => {
  return typeof n === 'number';
};

export const isArray = (n) => {
  return Array.isArray(n);
};

/**
 *
 * @param arr {[]} - array
 * @param n {any} - search
 * @return {boolean}
 */
export const inArray = (arr, n) => {
  return arr.includes(n);
};

export const niceBytes = (a, b) => {
  const bytes = Number(a);

  // Missing, negative or non numeric sizes (e.g. unknown MTP sizes) must not
  // render as "NaN undefined".
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 Bytes';
  }

  const c = 1024;
  const d = b || 2;
  const e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const f = Math.min(
    e.length - 1,
    Math.max(0, Math.floor(Math.log(bytes) / Math.log(c)))
  );

  return `${parseFloat((bytes / c ** f).toFixed(d))} ${e[f]}`; // eslint-disable-line no-restricted-properties
};

export const replaceBulk = (str, findArray, replaceArray) => {
  // An empty pattern list would build `new RegExp('')`, which matches between
  // every character and injects "undefined" into the string.
  if (!findArray || findArray.length < 1) {
    return str;
  }

  let i;
  let regex = [];
  const map = {};

  for (i = 0; i < findArray.length; i += 1) {
    regex.push(findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g, '\\$1'));
    map[findArray[i]] = replaceArray[i];
  }

  regex = regex.join('|');

  return str.replace(new RegExp(regex, 'g'), (matched) => {
    return map[matched];
  });
};

export const splitIntoLines = (str) => {
  if (undefinedOrNull(str)) {
    return null;
  }

  return str.toString().split(/(\r?\n)/g);
};

export const quickHash = (str) => {
  let hash = 0;
  let i;
  let chr;

  if (str.length === 0) {
    return hash;
  }

  for (i = 0; i < str.length; i += 1) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr; // eslint-disable-line no-bitwise
    hash |= 0; // eslint-disable-line no-bitwise
  }

  return hash;
};

export const percentage = (current, total) => {
  const _current = Number(current);
  const _total = Number(total);

  // Zero byte files (0 / 0) or bogus totals must not produce NaN/Infinity.
  if (!Number.isFinite(_current) || !Number.isFinite(_total) || _total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.floor((_current / _total) * 100)));
};

export const truncate = (str = '', length) => {
  const dots = str.length > length ? '...' : '';

  return str.substring(0, length) + dots;
};

export const stripRootSlash = (str) => {
  return str.replace(/^\//g, '');
};

export const springTruncate = (str, minChars = 10, ellipsis = '...') => {
  const _str = str;
  const strLength = str.length;

  if (strLength > minChars) {
    const ellipsisLength = ellipsis.length;

    if (ellipsisLength > minChars) {
      return {
        text: _str,
        truncatedText: str.substr(strLength - minChars),
        isTruncated: true,
      };
    }

    const count = -0.5 * (minChars - strLength - ellipsisLength);
    const center = strLength / 2;

    return {
      text: _str,
      truncatedText: `${str.substr(0, center - count)}${ellipsis}${str.substr(
        strLength - center + count
      )}`,
      isTruncated: true,
    };
  }

  return {
    text: _str,
    truncatedText: _str,
    isTruncated: false,
  };
};

export const undefinedOrNull = (_var) => {
  return typeof _var === 'undefined' || _var === null;
};

export const isEmpty = (x) => {
  if (undefinedOrNull(x)) {
    return true;
  }

  if (isObject(x) && Object.keys(x).length < 1) {
    return true;
  }

  return x.length < 1;
};

export const arrayEquality = (array1, array2) => {
  if (array1 === array2) {
    return true;
  }

  if (!isArray(array1) || !isArray(array2) || array1.length !== array2.length) {
    return false;
  }

  // Multiset comparison in O(n) instead of sorting both arrays (O(n log n)).
  const counts = new Map();

  array1.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));

  return array2.every((value) => {
    const count = counts.get(value);

    if (!count) {
      return false;
    }

    counts.set(value, count - 1);

    return true;
  });
};

export const arrayIntersection = (array1, array2) => {
  const array2Set = new Set(array2);

  return array1.filter((element) => array2Set.has(element));
};

export const keymapSearch = (keymap, keyedList) => {
  const keymapKeys = Object.keys(keymap);

  for (let index = 0; index < keymapKeys.length; index += 1) {
    const key = keymapKeys[index];

    if (arrayEquality(keymap[key], keyedList)) {
      return key;
    }
  }

  return null;
};

export const toggleFileExplorerDeviceType = (
  currentDeviceType,
  DEVICE_TYPE
) => {
  return currentDeviceType === DEVICE_TYPE.local
    ? DEVICE_TYPE.mtp
    : DEVICE_TYPE.local;
};

export const isFileExplorerOnFocus = () => {
  // elementFromPoint returns null while the window is hidden or resizing.
  return document.elementFromPoint(3, 2)?.id === APP_TITLEBAR_DOM_ID;
};

export const isString = (variable) => {
  return typeof variable === 'string' || variable instanceof String;
};

export const removeArrayDuplicates = (array) => {
  return [...new Set(array)];
};

export const getPluralText = (string, count, customPluralString = null) => {
  if (count > 1) {
    if (customPluralString) {
      return customPluralString;
    }

    return `${string}s`;
  }

  return string;
};

export const asserts = (condition, message) => {
  if (condition) {
    return;
  }

  throw new Error(message || 'Assertion failed');
};

export const capitalize = (s) => {
  if (isEmpty(s)) {
    return '';
  }

  if (typeof s !== 'string') {
    return '';
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const arrayAverage = (array) => {
  if (isEmpty(array)) {
    return 0;
  }

  return array.reduce((a, b) => a + b) / array.length;
};

export const isPrereleaseVersion = () => {
  return !!semver.prerelease(APP_VERSION);
};
