/**
 * Created by MMo2 on 6/20/2016.
 */
'use strict';

let charts = require('../modules/charts');
let excelHelper = require('../helpers/excelHelper');
let columnTypes = require('../helpers/column-types');

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
      row[setting.columns[j].key] =
        columnTypes.convertDataTableToFile(doc.datatable.rows[i].c[j].v, doc.datatable.cols[j].type)
    }
    datas.push(row);
  }
  excelHelper.writeXlsx(setting, datas, done, mode);
}

exports.updateFromFileToDB = function(doc, setting, done, mode) {
  excelHelper.readFile(setting, function(result) {
    // Result format:
    // [
    //   [
    //     'name(string)',
    //     'dept(string)',
    //     'lunchTime(timeofday)',
    //     'salary(number)',
    //     'hireDate(date)',
    //     'age(number)',
    //     'isSenior(boolean)',
    //     'seniorityStartTime(datetime)'
    //   ],
    //   [
    //     'John',
    //     'Eng',
    //     '12:00:00',
    //     1000,
    //     '2005-03-19',
    //     35,
    //     'true',
    //     '2007-12-02 15:56:00'
    //   ],
    //   [
    //     'Dave',
    //     'Eng',
    //     '12:00:00',
    //     500,
    //     '2006-04-19',
    //     27,
    //     'false',
    //     'null'
    //   ]
    // ]

    var updateData = {
		"friendlyUrl": doc.friendlyUrl
	};
    var column = result[0];
    updateData.datatable = {
      "cols": [{
        "type": "string",
        "label": column[0] ? column[0] : "Category"
      }],
      "rows": []
    };

    // remove this property
    // if (doc.domainDataType) {
    //   doc.datatable.cols[0].type = doc.domainDataType;
    // }
    if (result.length > 0) {
        updateData.datatable.cols[0].type = columnTypes.infer(result[1][0]);
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
          v: columnTypes.convertFileToDataTable(result[i][j])
        });
      }
      updateData.datatable.rows.push(row);
    }

    charts.updateOne(doc._id, updateData, done);
  }, mode);
}

exports.remove = function() {

}

exports.import = function() {

}
