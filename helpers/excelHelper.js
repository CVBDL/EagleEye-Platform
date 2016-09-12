/**
 * Created by MMo2 on 6/20/2016.
 */

"use strict";

var Excel = require('exceljs');
var fs = require('fs');
var path = require('path');

var defaultSetting = {
    creator: "EagleEye-Platform",
    lastModifiedBy: "EagleEye-Platform",
    worksheet: "Chart data"
};

var PRODUCTION_PATH = path.join(__dirname, '../excelPath/prod'),
    TEST_PATH = path.join(__dirname, '../excelPath/test');

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

var deleteTempFile = function(fileName) {
    var curPath = "." + excelHelper.getWorkPath(excelHelper.MODE_PRODUCTION) + fileName;
    if( fs.existsSync(curPath) ) {
        console.log("Delete file: " + curPath);
        fs.unlinkSync(curPath);
    }
}

var workbookToJSObject = function(worksheet, done) {
    var result = [];
    worksheet.eachRow(function(row, rowNumber) {
        var line = [];
        row.eachCell(function(cell, colNumber) {
            line.push(cell.value);
        });
        result.push(line);
    });
    done(result);
}

exports.writeXlsx = function(setting, data, done, mode) {
    if (!setting || !setting.columns || (!setting.filename && !setting.outStream)) {
        return;
    }
    mode = typeof mode !== 'undefined' ?  mode : exports.MODE_PRODUCTION;

    var workbook = createWorkbook(setting);

    var worksheet = workbook.addWorksheet(setting.worksheet ? setting.worksheet : defaultSetting.worksheet, 'FFC0000');

    worksheet.columns = setting.columns;

    // data.forEach(line => worksheet.addRow(line));
    worksheet.addRows(data);

    var path = mode === exports.MODE_TEST ? TEST_PATH : PRODUCTION_PATH;

    if (setting.outStream) {
        workbook.xlsx.write(setting.outStream).then(done);
    } else {
        workbook.xlsx.writeFile(path + "/" + setting.filename).then(done);
    }
};

exports.readFile = function(setting, done, mode) {
    var workbook = new Excel.Workbook();

    if (setting.filename) {
        mode = typeof mode !== 'undefined' ?  mode : exports.MODE_PRODUCTION;
        var path = mode === exports.MODE_TEST ? TEST_PATH : PRODUCTION_PATH;
        // console.log(path + "/" + setting.filename);
        workbook.xlsx.readFile(path + "/" + setting.filename)
            .then((workbook) => workbookToJSObject(workbook.getWorksheet(setting.worksheet), done));
    } else if (setting.inputStream) {
        //Not used
        // let inputStream = workbook.xlsx.createInputStream();
        // setting.inputStream.pipe(inputStream);
        // setting.inputStream.on('end', () =>
        //     workbookToJSObject(workbook.getWorksheet(setting.worksheet), done));
        // setting.inputStream.on('error', (err) => console.log(err));
    } else {
        console.log('default.');
        done();
    }
}

// exports.importFromPost = function(req, done) {
//     var workbook = new Excel.Workbook();
//     let inputStream = workbook.xlsx.createInputStream();
//     let busboy = new Busboy({ headers: req.headers });
//     let id = null;
//
//     // Listen for event when Busboy finds a file to stream.
//     busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
//         console.log(file);
//     });
//
//     // Listen for event when Busboy finds a non-file field.
//     busboy.on('field', function (fieldname, val) {
//         // Do something with non-file field.
//         console.log(fieldname + ": " + val);
//         if (fieldname == "id") id = val;
//     });
//
//     // Listen for event when Busboy is finished parsing the form.
//     busboy.on('finish', function () {
//         // console.log("id: " + id);
//         // console.log(fileStream.toBuffer());
//         console.log("on finish");
//         done();
//     });
//
//     // Pipe the HTTP Request into Busboy.
//     //req.pipe(busboy);
//     inputStream.pipe(req);
// }

exports.getWorkPath = (mode) => mode === exports.MODE_TEST ? TEST_PATH : PRODUCTION_PATH;
