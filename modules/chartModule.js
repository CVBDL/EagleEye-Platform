/**
 * Created by MMo2 on 6/14/2016.
 */
'use strict';

var ObjectId = require('mongodb').ObjectId;
var DB = require('../helpers/dbHelper');

var COLLECTION = "chart_collection";
exports.create = function(chartData, callback) {
    let db = DB.get()
    db.collection(COLLECTION).insert(chartData, function(err, result) {
        if (err) return callback(err);
        callback(null, result.insertedIds[0]);
    });
}

exports.all = function(callback) {
    let db = DB.get();
    db.collection(COLLECTION).find().toArray(callback);
}

exports.getOne = function(_id, callback) {
    let db = DB.get();
    console.log(db);
    let regExp = /^c-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).find({ "friendlyUrl": _id }).toArray(callback);
    } else {
        db.collection(COLLECTION).find({ "_id": ObjectId(_id) }).toArray(callback);
    }
}

exports.clearCollection = function(callback) {
    let db = DB.get();
    db.collection(COLLECTION).remove({}, function(err, result) {
        callback(err);
    });
}

exports.remove = function(_id, callback) {
    let db = DB.get();
    db.collection(COLLECTION).removeOne({ _id: ObjectId(_id) }, function(err, result) {
        callback(err);
    });
}

exports.updateOne = function(_id, updateData, callback) {
    let db = DB.get();
    let regExp = /^c-/g;

    if (regExp.test(_id)) {
        db.collection(COLLECTION).updateOne({ "friendlyUrl": _id }, updateData, function(err, result) {
            callback(err);
        });
    } else {
        db.collection(COLLECTION).updateOne({ _id: ObjectId(_id)}, updateData, function(err, result) {
            callback(err);
        });
    }
}