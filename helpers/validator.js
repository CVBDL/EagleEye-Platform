'use strict';

const CHART_TYPES = [
  'LineChart',
  'ColumnChart',
  'BarChart',
  'ComboChart',
  'AreaChart',
  'PieChart',
  'ImageChart'
];

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
  return CHART_TYPES.indexOf(chartType) > -1;
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
