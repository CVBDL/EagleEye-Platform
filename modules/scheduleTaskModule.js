/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

let ObjectId = require('mongodb').ObjectId;
let DB = require('../helpers/dbHelper');

const COLLECTION = "schedule_task_collection";

let getTimeStamp = () => new Date().valueOf();

exports.create = function(taskName, time, para, callback) {
  let db = DB.get();
  let taskData = {};
  taskData.timestamp = getTimeStamp();
  taskData.lastUpdateTimestamp = taskData.timestamp;
  taskData.enable = true;
  taskData.para = para;
  taskData.taskName = taskName;
  taskData.scheduleTimeString = time;

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

exports.enableOneTask = function(_id, enable, callback) {
  let db = DB.get();
  db.collection(COLLECTION).findOneAndUpdate({
    _id: ObjectId(_id)
  }, {
    $set: {
      enable: enable,
      lastUpdateTimestamp: getTimeStamp()
    }
  }, callback);
};

exports.updateOneTask = function(_id, taskName, time, enable, para, callback) {
  let db = DB.get();
  db.collection(COLLECTION).findOneAndUpdate({
    _id: ObjectId(_id)
  }, {
    $set: {
      taskName: taskName,
      scheduleTimeString: time,
      enable: enable,
      para: para,
      lastUpdateTimestamp: getTimeStamp()
    }
  }, callback);
};
