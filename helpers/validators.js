'use strict';

let ObjectId = require('mongodb').ObjectId;

let isUndefined = exports.isUndefined = function (value) {
  return typeof value === 'undefined';
};

let isDefined = exports.isDefined = function (value) {
  return typeof value !== 'undefined';
};

let isString = exports.isString = function (value) {
  return typeof value === 'string';
};

let isObject = exports.isObject = function (value) {
  return value !== null && typeof value === 'object';
};

let isValidDescription = exports.isValidDescription = function (description) {
  return isString(description);
};

let isValidDataTable = exports.isValidDataTable = function (dataTable) {
  return isObject(dataTable);
};

let isValidOptions = exports.isValidOptions = function (options) {
  return isObject(options);
};

let isValidChartIds = exports.isValidChartIds = function (ids) {
  if (Array.isArray(ids)) {
    return ids.every(function (id) {
      return ObjectId.isValid(id);
    })

  } else {
    return ObjectId.isValid(ids);
  }
};
