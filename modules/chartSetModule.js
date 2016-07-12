/**
 * Created by MMo2 on 6/14/2016.
 */
'use strict';

let ObjectId = require('mongodb').ObjectId;
let DB = require('../helpers/dbHelper');

let COLLECTION = "chart_set_collection";
let CHART_SET_TYPE = "chartset";

DB.DATABASE_KEYS.push({
    COLLECTION: COLLECTION,
    keys: [{
        key: { friendlyUrl: 1 },
        option: { unique: true, sparse: true }
    }]
});

let getTimeStamp = () => new Date().valueOf();

exports.create = function(chartSetData, callback) {
    let db = DB.get();

    chartSetData.type = CHART_SET_TYPE;
    chartSetData.timestamp = getTimeStamp();
    chartSetData.lastUpdateTimestamp = chartSetData.timestamp;

    db.collection(COLLECTION).insert(chartSetData, function(err, result) {
        if (err) {
            return callback(err, result);
        }

        callback(null, result.ops[0]);
    });
};

exports.all = function(callback) {
    let db = DB.get();

    db.collection(COLLECTION).find().toArray(callback);
};

exports.getOne = function(_id, callback) {
    let db = DB.get();
    let regExp = /^s-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).find({ "friendlyUrl": _id }).toArray(callback);
    } else {
        db.collection(COLLECTION).find({ "_id": ObjectId(_id) }).toArray(callback);
    }
};

exports.clearCollection = function(callback) {
    let db = DB.get();

    db.collection(COLLECTION).remove({}, function(err, result) {
        callback(err);
    });
};

exports.remove = function(_id, callback) {
    let db = DB.get();

    db.collection(COLLECTION).removeOne({ _id: ObjectId(_id) }, function(err, result) {
        callback(err);
    });
};

exports.updateOne = function(_id, updateData, callback) {
    let db = DB.get();
    db.collection(COLLECTION).update({"_id":ObjectId(_id)}
        ,{
            "$set": {
                "title":updateData.title,
                "description":updateData.description,
                "friendlyUrl":updateData.friendlyUrl,
                "charts":updateData.charts,
                lastUpdateTimestamp: getTimeStamp()
            }
        }
        ,false, function(err, result) {
        callback(err, result);
    });
};

exports.removeChartFromCharts = function(_id) {
    let db = DB.get();
    db.collection(COLLECTION).update( { "charts": _id }, { $pullAll: { "charts": [_id] } } );
}
