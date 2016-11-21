/**
 * Created by MMo2 on 6/20/2016.
 */
'use strict';

let charts = require('../modules/charts');
let column_types = require('../helpers/column-types');

exports.updateChartWithRawData = function(_id, data, done) {
    let updateData = {};
    let column = data[0];
    updateData.datatable = {
      "cols": [{
        "type": "string",
        "label": column[0] ? column[0] : "Category"
      }],
      "rows": []
    };
    if (data.length > 0) {
        updateData.datatable.cols[0].type = column_types.infer(data[1][0]);    
    }
    for (let i = 1; i < column.length; i++) {
      updateData.datatable.cols.push({
        "label": column[i],
        "type": "number"
      });
    }
    for (let i = 1; i < data.length; i++) {
      let row = {
        c: []
      };
      for (let j = 0; j < column.length; j++) {
        row.c.push({
          v: data[i][j]
        });
      }
      updateData.datatable.rows.push(row);
    }
    charts.updateOne(_id, updateData, done);
}