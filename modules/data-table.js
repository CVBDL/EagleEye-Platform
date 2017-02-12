'use strict';

let Exceljs = require('exceljs');
let Promise = require('es6-promise').Promise;
let columnTypes = require('../helpers/column-types');
let fileParser = require('./file-parser');
let validators = require('../helpers/validators');


let fromWorksheet = function fromWorksheet(worksheet) {
  if (worksheet.actualRowCount < 1) {
    return Promise.reject('empty file.');
  }

  let datatable = { cols: [], rows: [] };

  // default data type for role: 'domain'
  let defaultDomainType = 'string';

  // default data type for role: 'data'
  let defaultDataType = 'number';

  let preferredColumnDataType = [];

  // `rowNumber` start from 1
  worksheet.eachRow(function (row, rowNumber) {
    if (rowNumber === 1) {
      // process header row

      // `colNumber` start from 1
      row.eachCell(function (cell, colNumber) {
        datatable.cols.push({
          label: cell.value ? cell.value : 'Column' + colNumber,
          type: (colNumber === 1) ? defaultDomainType : defaultDataType
        });
      });

    } else {
      // process data rows

      let rowData = { c: [] };

      row.eachCell(function (cell, colNumber) {
        rowData.c.push({
          v: columnTypes.convertFileToDataTable(cell.value)
        });

        if (!preferredColumnDataType[colNumber - 1]) {
          let inferredType = columnTypes.infer(cell.value);

          preferredColumnDataType[colNumber - 1] =
            inferredType === 'null'
              ? undefined
              : inferredType;
        }
      });

      datatable.rows.push(rowData);
    }
  });

  // determine preferred data types
  preferredColumnDataType.forEach(function (type, index) {
    if (type) {
      datatable.cols[index].type = type;

    } else {
      datatable.cols[index].type =
        (index === 0)
          ? defaultDomainType
          : defaultDataType;
    }
  });

  return datatable;
};


let fromWorkbook = function fromWorkbook(workbook, id) {
  id = validators.isDefined(id) ? id : 1;

  let worksheet = workbook.getWorksheet(id);

  return fromWorksheet(worksheet);
};


exports.fromXLSXStream = function (stream) {
  return fileParser.readXLSXStream(stream)
    .then(function (workbook) {
      return fromWorkbook(workbook);
    });
};
