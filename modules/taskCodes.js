/**
 * Created by MMo2 on 8/18/2016.
 */

'use strict';
const chartModule = require('../modules/chartModule');
const chartSetModule = require('../modules/chartSetModule');
const statisticsModule = require('../modules/statisticsModule');

let taskCodeMap = {};

taskCodeMap['hello world'] = function() {
    console.log('hello world!');
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

exports.getAllTasks = function() {
    return taskCodeMap;
}
