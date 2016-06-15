/**
 * Created by MMo2 on 6/14/2016.
 */
var ObjectId = require('mongodb').ObjectId;
var DB = require('../helpers/dbHelper');

var COLLECTION = "chart_collection";
exports.create = function(chartData, callback) {
    let db = DB.get()
    db.collection(COLLECTION).insert(chartData, function(err, result) {
        if (err) return callback(err);
        callback(null, result.insertedIds[0]);
    })
}

exports.all = function(callback) {
    let db = DB.get();
    db.collection(COLLECTION).find().toArray(callback);
}

exports.getOne = function(_id, callback) {
    let db = DB.get();
    db.collection(COLLECTION).find({"_id": ObjectId(_id)}).toArray(callback);
}

exports.clearCollection = function(callback) {
    let db = DB.get();
    db.collection(COLLECTION).remove({}, function(err, result) {
        callback(err);
    });
}

exports.remove = function(id, callback) {
    let db = DB.get();
    db.collection(COLLECTION).removeOne({_id:id}, function(err, result) {
        callback(err);
    })
}