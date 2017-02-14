'use strict';

let ObjectId = require('mongodb').ObjectId;
let dbClient = require('../helpers/dbHelper');

const COLLECTION = "schedule_job_log_collection";


/**
 * Create a log.
 *
 * @method
 * @param {Object} job An job config object.
 * @returns {Promise} A promise will be resolved with the created log.
 *                    Or rejected with defined errors.
 */
exports.create = function(job) {
  let db = dbClient.get();

  let log = {
    job: job,
    state: 'running',
    startedAt: new Date().toISOString()
  };

  return db
    .collection(COLLECTION)
    .insertOne(log)
    .then(function (result) {
      return result.ops[0];
    });
};


/**
 * Update a single log.
 *
 * @method
 * @param {string} id The `_id` of a log.
 * @param {Object} data The updated log data.
 * @returns {Promise} A promise will be resolved with the updated log.
 *                    Or rejected with defined errors.
 */
exports.updateOne = function (id, data) {
  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "chart",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  let updateData = {};

  if (data.state == 'success' || data.state == 'failure') {
    updateData.state = data.state;
    updateData.finishedAt = new Date().toISOString();
  }

  let db = dbClient.get();

  return db
    .collection(COLLECTION)
    .findOneAndUpdate({
      _id: ObjectId(id)
    }, {
      $set: updateData
    }, {
      // When false, returns the updated document rather than
      // the original.
      returnOriginal: false
    })
    .then(function (result) {
      if (result.value === null) {
        return Promise.reject({
          status: 404
        });

      } else {
        return result.value;
      }
    });
};


/**
 * List all logs with the specific job id.
 *
 * @method
 * @param {string} id The `_id` of a job.
 * @returns {Promise} A promise will be resolved with logs.
 *                    Or rejected with defined errors.
 */
exports.getAllByJobId = function (id) {
  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "log",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  let db = dbClient.get();

  return db
    .collection(COLLECTION)
    .find({ 'job._id': ObjectId(id) })
    .toArray()
    .then(function (docs) {
      if (!docs.length) {
        return Promise.reject({
          status: 404
        });
      } else {
        return docs;
      }
    });
};


/**
 * Not in use currently.
 */
exports.all = function(callback) {
  let db = dbClient.get();
  db.collection(COLLECTION).find().toArray(callback);
};


/**
 * Not in use currently.
 */
exports.getOne = function(_id, callback) {
  let db = dbClient.get();
  db.collection(COLLECTION).find({
    "_id": ObjectId(_id)
  }).toArray(callback);
};


/**
 * Not in use currently.
 */
exports.remove = function(_id, callback) {
  let db = dbClient.get();
  db.collection(COLLECTION).removeOne({
    _id: ObjectId(_id)
  }, function(err, result) {
    callback(err);
  });
};
