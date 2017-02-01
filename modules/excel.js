/**
 * Created by MMo2 on 6/20/2016.
 */
'use strict';

let excelHelper = require('../helpers/excelHelper');
let columnTypes = require('../helpers/column-types');

exports.writeOne = function (doc, setting, done, mode) {
  setting.columns = doc.datatable.cols;
  for (var i = 0; i < setting.columns.length; i++) {
    setting.columns[i].header = setting.columns[i].label;
    setting.columns[i].key = "col" + (i + 1);
  }
  var datas = [];
  for (var i = 0; i < doc.datatable.rows.length; i++) {
    var row = {};
    for (var j = 0; j < setting.columns.length; j++) {
      row[setting.columns[j].key] =
        columnTypes.convertDataTableToFile(doc.datatable.rows[i].c[j].v, doc.datatable.cols[j].type)
    }
    datas.push(row);
  }
  excelHelper.writeXlsx(setting, datas, done, mode);
};
