'use strict';

let ObjectId = require('mongodb').ObjectId;

let chart = require('../modules/chart');

exports.isUndefined = function (value) {
  return typeof value === 'undefined';
};

exports.isDefined = function (value) {
  return typeof value !== 'undefined';
};

exports.isString = function (value) {
  return typeof value === 'string';
};

exports.isObject = function (value) {
  return value !== null && typeof value === 'object';
};

exports.isValidChartType = function (chartType) {
  let isValid = false;

  Object.keys(chart.TYPE).forEach(function (type) {
    if (chart.TYPE[type] === chartType) {
      isValid = true;
    }
  });

  return isValid;
};

exports.isValidDescription = function (description) {
  return exports.isString(description);
};

exports.isValidDataTable = function (dataTable) {
  return exports.isObject(dataTable);
};

exports.isValidOptions = function (options) {
  return exports.isObject(options);
};

exports.isValidChartIds = function (ids) {
  if (Array.isArray(ids)) {
    return ids.every(function (id) {
      return ObjectId.isValid(id);
    })

  } else {
    return ObjectId.isValid(ids);
  }
};
