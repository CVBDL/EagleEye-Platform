/**
 * Created by MMo2 on 6/14/2016.
 */
'use strict';

let ObjectId = require('mongodb').ObjectId;
let DB = require('../helpers/dbHelper');
let chartOptionsHelper = require('../helpers/chartOptionsHelper');
let chartSetModule = require('../modules/chartSetModule');

let COLLECTION = "chart_collection";
let CHART_TYPE = "chart";

DB.DATABASE_KEYS.push({
    COLLECTION: COLLECTION,
    keys: [{
        key: { friendlyUrl: 1 },
        option: { unique: true, sparse: true }
    }]
});

let getTimeStamp = () => new Date().valueOf();

exports.create = function (chartData, callback) {
    let db = DB.get();

    chartData.type = CHART_TYPE;
    chartData.timestamp = getTimeStamp();
    chartData.lastUpdateTimestamp = chartData.timestamp;
    chartData.options = chartOptionsHelper.ChartOptionsAdapter(chartData.chartType ,chartData.options);

    db.collection(COLLECTION).insert(chartData, function (err, result) {
        if (err) {
            return callback(err);
        }

        callback(null, result.ops[0]);
    });
};

exports.all = function (option, callback) {
    let db = DB.get();

    let cursor = db.collection(COLLECTION).find({}, false, option).toArray(callback);
    // another implement
    // if (option.sort) {
    //     cursor.sort(option.sort);
    // }
    // if (option.skip) {
    //     cursor.skip(option.skip);
    // }
    // if (option.limit) {
    //     cursor.limit(option.limit);
    // }
    // cursor.toArray(callback);
};

exports.getOne = function (_id, callback) {
    let db = DB.get();
    let regExp = /^c-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).find({"friendlyUrl": _id}).toArray(callback);

    } else {
        db.collection(COLLECTION).find({"_id": ObjectId(_id)}).toArray(callback);
    }
};

exports.clearCollection = function (callback) {
    let db = DB.get();

    db.collection(COLLECTION).remove({}, function (err, result) {
        callback(err);
    });
};

exports.remove = function (_id, callback) {
    let db = DB.get();
    db.collection(COLLECTION).removeOne({_id: ObjectId(_id)}, function (err, result) {
        callback(err);
        chartSetModule.removeChartFromCharts(_id);
    });
};

exports.updateOne = function (_id, updateData, callback) {
    let db = DB.get();
    let regExp = /^c-/g;

    updateData.lastUpdateTimestamp = getTimeStamp();

    if (regExp.test(_id)) {
        db.collection(COLLECTION).updateOne({"friendlyUrl": _id}, updateData, function (err, result) {
            callback(err);
        });
    } else {
        db.collection(COLLECTION).updateOne({_id: ObjectId(_id)}, updateData, function (err, result) {
            callback(err);
        });
    }
};

exports.getChartOptionById = function (_id, callback) {
    let db = DB.get();
    let regExp = /^c-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).find({"friendlyUrl": _id}).toArray(callback);
    } else {
        db.collection(COLLECTION).find({"_id": ObjectId(_id)}).toArray(callback);
    }
};

exports.updateChartOptionById = function (_id, updateData, callback) {
    let db = DB.get();
    let regExp = /^c-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).findOneAndUpdate({"friendlyUrl": _id}, {$set: {options: updateData, lastUpdateTimestamp: getTimeStamp()}}, callback);
    } else {
        db.collection(COLLECTION).findOneAndUpdate({_id: ObjectId(_id)}, {$set: {options: updateData, lastUpdateTimestamp: getTimeStamp()}}, callback);
    }
};

exports.getChartDataTableById = function (_id, callback) {
    let db = DB.get();
    // console.log(db);
    let regExp = /^c-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).find({"friendlyUrl": _id}).toArray(callback);
    } else {
        db.collection(COLLECTION).find({"_id": ObjectId(_id)}).toArray(callback);
    }
};

exports.updateChartDataTableById = function (_id, updateData, callback) {
    let db = DB.get();
    let regExp = /^c-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).findOneAndUpdate({"friendlyUrl": _id}, {$set: {datatable: updateData, lastUpdateTimestamp: getTimeStamp()}}, callback);
    } else {
        db.collection(COLLECTION).findOneAndUpdate({_id: ObjectId(_id)}, {$set: {datatable: updateData, lastUpdateTimestamp: getTimeStamp()}}, callback);
    }
};
