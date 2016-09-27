/**
 * Created by XZhang21 on 7/5/2016.
 */
'use strict';

function _ChartOptionsAdapter(type, originalOption) {
  this.type = type;
  this.options = originalOption;
  this.default_options = require('../helpers/default-chart-options').chartOptions[type];
  if (!this.default_options) {
    this.default_options = {}
  }
  if (!this.default_options.hAxis) {
    this.default_options.hAxis = {};
  }
  if (!this.default_options.vAxis) {
    this.default_options.vAxis = {};
  }
  this.new_options = {};
  this.assignOptions = function() {
    this.new_options = Object.assign(this.options, this.default_options);
  };
  this._lineChart = function() {
    this.default_options.hAxis = Object.assign(this.default_options.hAxis, this.options.hAxis);
    this.default_options.vAxis = Object.assign(this.default_options.vAxis, this.options.vAxis);
    this.assignOptions();
  };
  this._columnChart = function() {
    //TODO
    this.default_options.hAxis = Object.assign(this.default_options.hAxis, this.options.hAxis);
    this.default_options.vAxis = Object.assign(this.default_options.vAxis, this.options.vAxis);
    this.assignOptions();
  };
  this._barChart = function() {
    //TODO
    this.default_options.hAxis = Object.assign(this.default_options.hAxis, this.options.hAxis);
    this.default_options.vAxis = Object.assign(this.default_options.vAxis, this.options.vAxis);
    this.assignOptions();
  };
  this._comboChart = function() {
    //TODO
    this.default_options.hAxis = Object.assign(this.default_options.hAxis, this.options.hAxis);
    this.default_options.vAxis = Object.assign(this.default_options.vAxis, this.options.vAxis);
    this.assignOptions();
  };
  this._areaChart = function() {
    //TODO
    this.default_options.hAxis = Object.assign(this.default_options.hAxis, this.options.hAxis);
    this.default_options.vAxis = Object.assign(this.default_options.vAxis, this.options.vAxis);
    this.assignOptions();
  };
  this._imageChart = function() {
    //TODO
    this.assignOptions();
  };
}
_ChartOptionsAdapter.prototype.adapterOptions = function() {
  try {
    if (!this.type || !this.options) {
      throw 'Invalid options or type.';
    }
    switch (this.type) {
      case "LineChart":
        this._lineChart();
        break;
      case "ColumnChart":
        this._columnChart();
        break;
      case "BarChart":
        this._barChart();
        break;
      case "ComboChart":
        this._comboChart();
        break;
      case "AreaChart":
        this._areaChart();
        break;
      case "ImageChart":
        this._imageChart();
        break;
      default:
        console.log("Can not find defined Chart type.");
    }
  } catch (_e) {
    console.log(_e);
    return this.options;
  }
  return this.new_options;
};

exports.ChartOptionsAdapter = function(type, originalOption) {
  return new _ChartOptionsAdapter(type, originalOption).adapterOptions();
};
