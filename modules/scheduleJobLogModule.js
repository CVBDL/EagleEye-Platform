/**
 * Created by MMo2 on 11/22/2016.
 */
'use strict';

let ObjectId = require('mongodb').ObjectId;
let DB = require('../helpers/dbHelper');

const COLLECTION = "schedule_job_log_collection";

let getTimeStamp = () => new Date().valueOf();

exports.create = function(jobData, callback) {
  let db = DB.get();
  let logData = { 'job': jobData, 'state': 'running'};
  logData.startedAt = getTimeStamp();

  db.collection(COLLECTION).insert(logData, function(err, result) {
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

exports.getLogsByJob = function(jobId, callback) {
  let db = DB.get();
  db.collection(COLLECTION).find({'jobId': jobId}).toArray(callback);
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
  if (updateData.state == 'success' || updateData.state == 'failure') {
    updateData.finishedAt = getTimeStamp();
  }

  db.collection(COLLECTION).updateOne({
    _id: ObjectId(_id)
  }, {$set: updateData}, callback);
};
