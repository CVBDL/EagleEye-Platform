/**
 * Created by MMo2 on 6/20/2016.
 */

var Excel = require('exceljs');
var stream = require("stream");

var defaultSetting = {
    creator: "EagleEye-Platform",
    lastModifiedBy: "EagleEye-Platform",
};

var PRODUCTION_PATH = './excelPath/prod',
    TEST_PATH = './excelPath/test';

exports.MODE_TEST = 'mode_test'
exports.MODE_PRODUCTION = 'mode_production'

var createWorkbook = function(setting) {
    var workbook = new Excel.Workbook();

    if (setting.creator)
        workbook.creator = setting.creator;
    else
        workbook.creator = defaultSetting.creator;
    if (setting.lastModifiedBy)
        workbook.lastModifiedBy = setting.lastModifiedBy;
    else
        workbook.lastModifiedBy = defaultSetting.lastModifiedBy;

    if (setting.created)
        workbook.created = created;
    else
        workbook.created = new Date();

    workbook.modified = new Date();

    return workbook;
}

var workbookToJSObject = function(workbook, result) {
}

exports.writeXlsx = function(setting, data, done, mode) {
    if (!setting || !setting.columns || !setting.filename) {
        return;
    }
    mode = typeof mode !== 'undefined' ?  mode : exports.MODE_PRODUCTION;

    var workbook = createWorkbook(setting);

    var worksheet = workbook.addWorksheet('My Sheet', 'FFC0000');

    worksheet.columns = setting.columns;

    data.forEach(line => worksheet.addRow(line));

    var path = mode === exports.MODE_TEST ? TEST_PATH : PRODUCTION_PATH;

    if (setting.outStream) {
        workbook.xlsx.write(setting.outStream).then(done);
    } else {
        workbook.xlsx.writeFile(path + "/" + setting.filename).then(done);
    }
};

exports.readFile = function(setting, result, done, mode) {
    var workbook = new Excel.Workbook();
    
    if (setting.filename) {
        mode = typeof mode !== 'undefined' ?  mode : exports.MODE_PRODUCTION;
        var path = mode === exports.MODE_TEST ? TEST_PATH : PRODUCTION_PATH;
        workbook.xlsx.readFile(path + "/" + setting.filename)
            .then(done);
    } else if (setting.inputStream) {
        stream.pipe(workbook.xlsx.createInputStream())
            .then(done);
    } else {
        console.log('default.');
        done();
    }
}

exports.getWorkPath = (mode) => mode === exports.MODE_TEST ? TEST_PATH : PRODUCTION_PATH;