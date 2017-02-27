'use strict';

let ObjectId = require('mongodb').ObjectId;

let dbClient = require('../helpers/db');
let job = require('./job');

const COLLECTION = dbClient.COLLECTION.TASK;
const RESOURCE_NAME = 'task';


/**
 * Not in use currently.
 */
exports.list = function() {
  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .find({})
      .toArray();
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
exports.listByJobId = function (jobId) {
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
exports.get = function (id) {
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

  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .find({ _id: ObjectId(id) })
      .limit(1)
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
    resourceName: RESOURCE_NAME,
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
exports.update = function (id, data) {
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
          let jobId = result.value.job._id.toHexString();

          return job.update(jobId, { lastState: result.value.state })
            .then(function () {
              return result.value;
            });
        }
      });
  });
};


/**
 * Not in use currently.
 */
exports.delete = function (id) {
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

  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .deleteOne({ _id: ObjectId(id) })
      .then(function (result) {
        if (result.deletedCount === 0) {
          return Promise.reject({
            status: 404
          });

        } else {
          return result;
        }
      });
  });
};
