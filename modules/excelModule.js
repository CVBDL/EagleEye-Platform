/**
 * Created by MMo2 on 6/20/2016.
 */
'use strict';

let chartModule = require('../modules/chartModule');
let excelHelper = require('../helpers/excelHelper');

exports.writeOne = function(doc, done, mode) {
    var setting = {
        //"outStream": outputStream,
        "filename": "testChartModule2Excel.xlsx",
        "worksheet": "Data",
    };
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

exports.updateFromFile = function(doc, filename, done, mode) {
    var setting = {filename: filename};
    excelHelper.readFile(setting, function(result) {
        // [ 
        //     [ 'Category', 'value1', 'value2', 'value3' ],
        //     [ 'Apple', 5, 9, 11 ],
        //     [ 'Orange', 7, 3, 12 ],
        //     [ 'Banana', 9, 5, 14 ]
        // ]
        console.log(result);
        done(result);
    }, mode);
}

exports.remove = function() {

}

exports.import = function() {

}