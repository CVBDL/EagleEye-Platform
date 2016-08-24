/**
 * Created by MMo2 on 8/18/2016.
 */

'use strict';
const chartModule = require('../modules/chartModule');
const chartSetModule = require('../modules/chartSetModule');
const statisticsModule = require('../modules/statisticsModule');
const excelModule = require('../modules/excelModule');

let taskCodeMap = {};

taskCodeMap['hello world'] = function() {
    console.log('hello world! ' + new Date());
}

taskCodeMap['Count Chart'] = function() {
    chartModule.all({}, function (err, charts) {
        chartSetModule.all({}, function (err, chartSets) {
            var countInfoData = {
                "chartCount": charts.length,
                "chartSetCount": chartSets.length
            };
            statisticsModule.create(countInfoData, () => console.log("Doc count task success at: " + new Date()));
        });
    });
}

taskCodeMap['download and import'] = function(url) {
    var http = require('http');
    var fs = require('fs');
    var fileName = new Date().valueOf() + Math.random() + ".xlsx";
    var file = fs.createWriteStream("./excelPath/prod/" + fileName);
    var request = http.get(url, function(response) {
        var stream = response.pipe(file);
        stream.on('finish', function () {
            console.log("import");
            // excelHelper.readFile({filename: fileName}, function(result) {
            //     console.log("import");
            // }, excelHelper.MODE_PRODUCTION);
            chartModule.create({default_options: {}}, function(err, doc) {
                chartModule.getOne(doc._id, function(err, docs) {
                    if (docs.length < 1) {
                        console.log('failed');
                        return;
                    }
                    excelModule.updateFromFileToDB(docs[0], {filename: fileName, worksheet: "Data"}, function (result) {
                        //console.log(result);
                        console.log('ok');
                        if (fs.existsSync("./excelPath/prod/" + fileName)) {
                            fs.unlinkSync("./excelPath/prod/" + fileName);
                        }
                    });
                });
            });

        });

    });
}

exports.getAllTasks = function() {
    return taskCodeMap;
}
