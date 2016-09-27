/**
 * Created by MMo2 on 6/20/2016.
 */
'use strict';

let chartModule = require('../modules/chartModule');
let excelHelper = require('../helpers/excelHelper');

exports.writeOne = function(doc, setting, done, mode) {
  setting.columns = doc.datatable.cols;
  for (var i = 0; i < setting.columns.length; i++) {
    setting.columns[i].header = setting.columns[i].label;
    setting.columns[i].key = "col" + (i + 1);
  }
  var datas = [];
  for (var i = 0; i < doc.datatable.rows.length; i++) {
    var row = {};
    for (var j = 0; j < setting.columns.length; j++) {
      row[setting.columns[j].key] = doc.datatable.rows[i].c[j].v;
    }
    datas.push(row);
  }
  excelHelper.writeXlsx(setting, datas, done, mode);
}

exports.updateFromFileToDB = function(doc, setting, done, mode) {
  excelHelper.readFile(setting, function(result) {
    // Result format:
    // [
    //     [ 'Category', 'value1', 'value2', 'value3' ],
    //     [ 'Apple', 5, 9, 11 ],
    //     [ 'Orange', 7, 3, 12 ],
    //     [ 'Banana', 9, 5, 14 ]
    // ]
    let updateData = doc;
    var column = result[0];
    doc.datatable = {
      "cols": [{
        "type": "string",
        "label": column[0] ? column[0] : "Category"
      }],
      "rows": []
    };
    if (doc.domainDataType) {
      doc.datatable.cols[0].type = doc.domainDataType;
    }
    for (let i = 1; i < column.length; i++) {
      updateData.datatable.cols.push({
        "label": column[i],
        "type": "number"
      });
    }
    for (let i = 1; i < result.length; i++) {
      var row = {
        c: []
      };
      for (let j = 0; j < column.length; j++) {
        row.c.push({
          v: result[i][j]
        });
      }
      updateData.datatable.rows.push(row);
    }
    chartModule.updateOne(doc._id, updateData, done);
  }, mode);
}

exports.remove = function() {

}

exports.import = function() {

}
