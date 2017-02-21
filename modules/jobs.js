'use strict';

let ObjectId = require('mongodb').ObjectId;
let Promise = require('es6-promise').Promise;

let dbClient = require('../helpers/dbHelper');
let validators = require('../helpers/validators');
let scheduler = require('../helpers/scheduler');

const COLLECTION = dbClient.COLLECTION.JOB;

const JOB_SCHEMA = {
  _id: {
    type: 'ObjectId',
    required: false
  },
  name: {
    type: 'string',
    required: true
  },
  expression: {
    type: 'string',
    required: true
  },
  command: {
    type: 'string',
    required: true
  },
  enabled: {
    type: 'boolean',
    required: false
  },
  createdAt: {
    type: 'string',
    required: false
  },
  updatedAt: {
    type: 'string',
    required: false
  },
  lastState: {
    type: 'string',
    required: false,
    options: ['running', 'success', 'failure']
  }
};

/**
 * Create a new job.
 *
 * @method
 * @param {string} name The new chart object.
 * @param {string} expression The chart's type.
 * @param {string} command The chart's description.
 * @returns {Promise} A promise will be resolved with new created chart.
 *                    Or rejected with defined errors.
 */
exports.create = function (data) {
  let schema = {
    _id: ObjectId(),
    name: null,
    expression: null,
    command: null,
    enabled: true,
    createdAt: null,
    updatedAt: null,
    lastState: null
  };

  let errors = [];
  let requiredFields = ['name', 'expression', 'command'];

  // set required fields
  requiredFields.forEach(function (field) {
    if (validators.isUndefined(data[field])) {
      errors.push({
        resource: "job",
        field: field,
        code: "missing_field"
      });

    } else {
      schema[field] = data[field];
    }
  });

  if (errors.length) {
    return Promise.reject({
      status: 422,
      errors: errors
    });
  }

  // set `enabled` field
  schema.enabled =
    validators.isDefined(data.enabled)
      ? !!data.enabled
      : true;

  // set `createdAt` and `updatedAt` fields
  schema.createdAt = schema.updatedAt = new Date().toISOString();

  let stat = scheduler.schedule(schema);

  if (stat.jobHandler === null) {
    return Promise.reject({
      status: 400,
      customMessage: 'Scheduling Job Failed'
    });

  } else {
    return dbClient.connect().then(function (db) {

      return db
        .collection(COLLECTION)
        .insertOne(schema)
        .then(function (result) {
          return result.ops[0];
        });
    });
  }
};


/**
 * List all jobs.
 *
 * @method
 * @returns {Promise} A promise will be resolved with jobs list.
 *                    Or rejected with defined errors.
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
 * Get a single job.
 *
 * @method
 * @param {string} id The job's '_id' property.
 * @returns {Promise} A promise will be resolved with the found job.
 *                    Or rejected with defined errors.
 */
exports.getOne = function (id) {
  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "job",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .find({ "_id": ObjectId(id) })
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
 * Delete a single job.
 *
 * @method
 * @param {string} id The `_id` property of a job.
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected with defined errors.
 */
exports.deleteOne = function (id) {
  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "job",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  // cancel and delete the scheduled job
  scheduler.deleteJob(id);

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
