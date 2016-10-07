/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

let ObjectId = require('mongodb').ObjectId;
let DB = require('../helpers/dbHelper');

const COLLECTION = "statistics_collection";

let getTimeStamp = () => new Date().valueOf();

exports.create = function(taskData, callback) {
  let db = DB.get();

  taskData.timestamp = getTimeStamp();
  taskData.lastUpdateTimestamp = taskData.timestamp;
  taskData.enable = true;

  db.collection(COLLECTION).insert(taskData, function(err, result) {
    if (err) {
      return callback(err);
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
  db.collection(COLLECTION).find({
    "_id": ObjectId(_id)
  }).toArray(callback);
};

exports.remove = function(_id, callback) {
  let db = DB.get();
  db.collection(COLLECTION).removeOne({
    _id: ObjectId(_id)
  }, function(err, result) {
    callback(err);
  });
};

exports.updateOne = function(_id, updateData, callback) {
  let db = DB.get();

  updateData.lastUpdateTimestamp = getTimeStamp();

  db.collection(COLLECTION).updateOne({
    _id: ObjectId(_id)
  }, updateData, function(err, result) {
    callback(err);
  });
};
