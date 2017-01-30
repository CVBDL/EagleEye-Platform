'use strict';

const CHART_TYPES = require('../modules/chart-types');

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

  Object.keys(CHART_TYPES).forEach(function (type) {
    if (type === chartType) {
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
