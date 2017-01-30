'use strict';

/**
 * Supported chart types.
 * Reference docs:
 * <https://developers.google.com/chart/interactive/docs/>
 * @constant
 * @type {Object}
 */
const CHART_TYPES = {

  // standard google chart types
  AreaChart: 'AreaChart',
  BarChart: 'BarChart',
  ColumnChart: 'ColumnChart',
  ComboChart: 'ComboChart',
  LineChart: 'LineChart',
  PieChart: 'PieChart',

  // custom chart types
  ImageChart: 'ImageChart'
};

module.exports = CHART_TYPES;
