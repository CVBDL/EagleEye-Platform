/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

let ObjectId = require('mongodb').ObjectId;
let DB = require('../helpers/dbHelper');

const COLLECTION = "schedule_job_collection";

let getTimeStamp = () => new Date().valueOf();

exports.create = function(jobName, time, para, callback) {
  let db = DB.get();
  let jobData = {};
  jobData.timestamp = getTimeStamp();
  jobData.lastUpdateTimestamp = jobData.timestamp;
  jobData.enable = true;
  jobData.para = para;
  jobData.jobName = jobName;
  jobData.scheduleTimeString = time;

  db.collection(COLLECTION).insert(jobData, function(err, result) {
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
    callback(err, result);
  });
};

exports.enableOneJob = function(_id, enable, callback) {
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

exports.updateOneJob = function(_id, jobName, time, enable, para, callback) {
  let db = DB.get();
  db.collection(COLLECTION).findOneAndUpdate({
    _id: ObjectId(_id)
  }, {
    $set: {
      jobName: jobName,
      scheduleTimeString: time,
      enable: enable,
      para: para,
      lastUpdateTimestamp: getTimeStamp()
    }
  }, callback);
};
