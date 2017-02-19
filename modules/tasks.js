'use strict';

let ObjectId = require('mongodb').ObjectId;

let dbClient = require('../helpers/dbHelper');

const COLLECTION = dbClient.COLLECTION.TASK;


/**
 * Create a task.
 *
 * @method
 * @param {Object} job An job config object.
 * @returns {Promise} A promise will be resolved with the created task.
 *                    Or rejected with defined errors.
 */
exports.create = function (job) {
  if (!job) {
    return Promise.reject({
      status: 422,
      errors: [{
        resource: "task",
        field: "job",
        code: "missing_field"
      }]
    });
  }
  
  let task = {
    job: job,
    state: 'running',
    startedAt: new Date().toISOString(),
    finishedAt: null
  };

  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .insertOne(task)
      .then(function (result) {
        return result.ops[0];
      });
  });
};


/**
 * Update a single task.
 *
 * @method
 * @param {string} id The `_id` of a task.
 * @param {Object} data The updated task data.
 * @returns {Promise} A promise will be resolved with the updated task.
 *                    Or rejected with defined errors.
 */
exports.updateOne = function (id, data) {
  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "task",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  let updateData = {};

  if (data.state == 'success' || data.state == 'failure') {
    updateData.state = data.state;
    updateData.finishedAt = new Date().toISOString();

  } else {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "task",
        "field": "state",
        "code": "invalid"
      }]
    });
  }

  return dbClient.connect().then(function (db) {

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
  });
};


/**
 * List all tasks with the specific job id.
 *
 * @method
 * @param {string} jobId The `_id` of a job.
 * @returns {Promise} A promise will be resolved with tasks.
 *                    Or rejected with defined errors.
 */
exports.getAllByJobId = function (jobId) {
  if (!ObjectId.isValid(jobId)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "task",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .find({ 'job._id': ObjectId(jobId) })
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
  });
};


/**
 * Not in use currently.
 */
exports.all = function() {
  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .find({})
      .toArray();
  });
};


/**
 * Not in use currently.
 */
exports.getOne = function(_id) {
  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .find({
        "_id": ObjectId(_id)
      }).toArray();
  });
};


/**
 * Not in use currently.
 */
exports.remove = function(_id, callback) {
  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .removeOne({
        _id: ObjectId(_id)
      });
  });
};
