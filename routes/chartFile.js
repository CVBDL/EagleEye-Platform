/**
 * Created by MMo2 on 6/20/2016.
 */

var excelHelper = require('../helpers/excelHelper');
var express = require('express');
var router = express.Router();

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

module.exports = router;