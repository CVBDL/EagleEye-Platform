/**
 * Created by MMo2 on 6/20/2016.
 */
"use strict";

let excelHelper = require('../helpers/excelHelper');
let express = require('express');
let chartModule = require('../modules/chartModule');
let excelModule = require('../modules/excelModule');
let fs = require('fs');

var multipart = require('connect-multiparty'),
     multipartyMiddleware = multipart();
let router = express.Router();

router.get('/testDownload', function(req, res, next) {
    res.setHeader('Content-disposition', 'attachment; filename=test.xlsx');
    res.setHeader('Content-type', 'application/vnd.ms-excel');

    excelHelper.writeXlsx(
        {
            filename: "test.xlsx",
            columns: [
                { header: 'Id', key: 'id', width: 10 },
                { header: 'Name', key: 'name', width: 32 },
                { header: 'D.O.B.', key: 'DOB', width: 10 }
            ],
            outStream: res
        },
        [
            {id: 1, name: 'John Doe', DOB: new Date(1970,1,1)},
            {id: 2, name: 'Jane Doe', DOB: new Date(1965,1,7)}
        ],
        () => console.log("File write done.")
    );
});

router.get('/testWrite', function(req, res, next) {
    excelHelper.writeXlsx(
        {
            filename: "test.xlsx",
            columns: [
                { header: 'Id', key: 'id', width: 10 },
                { header: 'Name', key: 'name', width: 32 },
                { header: 'D.O.B.', key: 'DOB', width: 10 }
            ]
        },
        [
            {id: 1, name: 'John Doe', DOB: new Date(1970,1,1)},
            {id: 2, name: 'Jane Doe', DOB: new Date(1965,1,7)}
        ],
        () => res.send("File write done.")
    );
});

router.post('/upload', function(req, multipartyMiddleware) {
    let file = req.files.file;
    let fileName = "";
    if (file.path.indexOf("/") > -1) {
        let pathArray = file.path.split("/");
        fileName = pathArray[pathArray.length - 1];
    } else {
        let pathArray = file.path.split("\\");
        fileName = pathArray[pathArray.length - 1];
    }
    // console.log(req.body.id);
    chartModule.getOne(req.body.id, function(err, docs) {
        if (docs.length < 1) {
            multipartyMiddleware.send('failed');
            return;
        }
        excelModule.updateFromFileToDB(docs[0], {filename: fileName, worksheet: "Data"}, function (result) {
            //console.log(result);
            multipartyMiddleware.send('ok');
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
    });
});

router.post('/uploadImage', function(req, multipartyMiddleware) {
    let file = req.files.file;
    let fileName = "";
    if (file.path.indexOf("/") > -1) {
        let pathArray = file.path.split("/");
        fileName = pathArray[pathArray.length - 1];
    } else {
        let pathArray = file.path.split("\\");
        fileName = pathArray[pathArray.length - 1];
    }

    let targetFileName = 'IC_' + Math.ceil(Math.random()*1000000) + fileName;
    let targetPath = './public/uploadChartImages/' + targetFileName;

    chartModule.updateImageChartFile(req.body.id, targetFileName, function(err, result) {
        if (err) {
            multipartyMiddleware.send('failed');
            return;
        } else
            multipartyMiddleware.send('ok');

        let stream = fs.createReadStream(file.path).pipe(fs.createWriteStream(targetPath));
        stream.on('finish', () => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
    });
});

router.get('/downloadExcel/:id', function(req, res, next) {
    let id = req.params.id;

    chartModule.getOne(req.params.id, function(err, docs) {
        if (docs.length > 0) {
            res.setHeader('Content-disposition', 'attachment; filename=' + (docs[0]._id) + '.xlsx');
            res.setHeader('Content-type', 'application/vnd.ms-excel');
            excelModule.writeOne(docs[0], {
                "outStream": res,
                "worksheet": "Data",
            }, ()=>console.log());
        }
    })
});

module.exports = router;
