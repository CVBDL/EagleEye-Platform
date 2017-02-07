'use strict';

let ObjectId = require('mongodb').ObjectId;
let Promise = require('es6-promise').Promise;

let dbClient = require('../helpers/dbHelper');
let validator = require('../helpers/validator');
let charts = require('./charts');

let COLLECTION = "chart_set_collection";

dbClient.DATABASE_KEYS.push({
  COLLECTION: COLLECTION,
  keys: [{
    title: "text",
    description: "text"
  }]
});


/**
 * Create a new chart set.
 *
 * @method
 * @param {Object} data The new chart set object.
 * @param {?string} [data.title=null] The chart set title.
 * @param {?string} [data.description=null] The chart set description.
 * @param {Array} [data.charts] The charts' ids belong to this chart set.
 * @returns {Promise} A promise will be resolved with new created chart set.
 *                    Or rejected with defined errors.
 */
exports.create = function (data) {
  let db = dbClient.get();

  // chart set schema
  let schema = {
    _id: null,
    title: null,
    description: null,
    charts: [],
    createdAt: null,
    updatedAt: null
  };

  const id = ObjectId();

  schema._id = id;

  if (validator.isString(data.title)) {
    schema.title = data.title;
  }

  if (validator.isValidDescription(data.description)) {
    schema.description = data.description;
  }
  
  if (validator.isValidChartIds(data.charts)) {
    schema.charts = data.charts;

  } else {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "chart-sets",
        "field": "charts",
        "code": "invalid"
      }]
    });
  }

  schema.createdAt = schema.updatedAt = new Date().toISOString();

  return db.collection(COLLECTION)
    .insertOne(schema)
    .then(function (result) {
      return result.ops[0];
    });
};


/**
 * Get all chart sets.
 *
 * @method
 * @param {Object} params URL query parameters.
 * @param {string} [params.query] Query for find operation.
 * @param {Array<Array<string>>} [params.sort] Set to sort the documents
 *                                             coming back from the query.
 * @param {number} [params.skip] Set to skip N documents ahead in your
 *                               query (useful for pagination).
 * @param {number} [params.limit] Sets the limit of documents returned in
 *                                the query.
 * @returns {Promise} A promise will be resolved with new created chart set.
 *                    Or rejected with defined errors.
 */
exports.all = function (params) {
  let db = dbClient.get();
  let query = {};

  params = params || {};

  if (params.query) {
    query["$text"] = {
      "$search": params.query
    };

    delete params.query;
  }

  return db.collection(COLLECTION)
    .find(query, false, params)
    .toArray();
};


/**
 * Get a single chart set.
 *
 * @method
 * @param {string} id The chart set '_id' property.
 * @returns {Promise} A promise will be resolved with the found chart set.
 *                    Or rejected with defined errors.
 */
exports.getOne = function (id) {
  let db = dbClient.get();

  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "chart-sets",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }
  
  return db.collection(COLLECTION)
    .find({ "_id": ObjectId(id) })
    .limit(1)
    .toArray()
    .then(function (docs) {
      if (!docs.length) {
        return Promise.reject({
          status: 404
        });
      }

      let promiseQueue = [];

      docs[0].charts.forEach(function (chartId, index) {
        promiseQueue.push(charts.getOne(chartId));
      });

      return Promise.all(promiseQueue)
        .then(function (result) {
          docs[0].charts = [];

          result.forEach(function (chart) {
            docs[0].charts.push(chart[0]);
          });

          return docs[0];
        });
    });
};


/**
 * Delete all chart sets.
 *
 * @method
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected when error occurred.
 */
exports.deleteAll = function () {
  let db = dbClient.get();

  return db.collection(COLLECTION).deleteMany();
};


/**
 * Delete a single chart set.
 *
 * @method
 * @param {string} id The chart set '_id' property.
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected with defined errors.
 */
exports.deleteOne = function (id) {
  let db = dbClient.get();

  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "chart-sets",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  return db.collection(COLLECTION)
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
};

exports.updateOne = function (_id, updateData, callback) {
  let db = dbClient.get();
  let now = new Date();
  let update = {
    "$set": updateData
  };

  db.collection(COLLECTION).findAndModify({
    "_id": ObjectId(_id)

  }, [], update, { new: true }, function (err, result) {
    callback(err, result);
  });
};

// TODO: update `updatedAt`
exports.removeChartFromCharts = function (_id) {
  let db = dbClient.get();
  db.collection(COLLECTION).update({
    "charts": _id
  }, {
      $pullAll: {
        "charts": [_id]
      }
    });
};
