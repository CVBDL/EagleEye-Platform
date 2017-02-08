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

  let db = dbClient.get();
  
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

  let db = dbClient.get();
  
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


/**
 * Update a single chart set.
 *
 * @method
 * @param {string} id The chart set '_id' property.
 * @param {Object} data The updated chart set data object.
 * @param {?string} [data.title] The chart set description field.
 * @param {?string} [data.description] The chart set description field.
 * @param {Array} [data.charts] The chart set charts field.
 * @returns {Promise} A promise will be resolved with the updated chart set.
 *                    Or rejected with defined errors.
 */
exports.updateOne = function (id, data) {
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

  let db = dbClient.get();
  let fields = ['title', 'description', 'charts'];
  let updateData = {
    updatedAt: new Date().toISOString()
  };

  fields.forEach(function (field) {
    if (validator.isDefined(data[field])) {
      updateData[field] = data[field];
    }
  });

  return db.collection(COLLECTION)
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

// TODO: update `updatedAt`
exports.deleteChartInChartSets = function (id) {
  if (!ObjectId.isValid(id)) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "charts",
        "field": "_id",
        "code": "invalid"
      }]
    });
  }

  let db = dbClient.get();

  return db.collection(COLLECTION)
    .updateMany({
      "charts": id
    }, {
      $pullAll: {
        "charts": [id]
      },
      $set: {
        updatedAt: new Date().toISOString()
      }
    });
};
