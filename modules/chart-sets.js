'use strict';

let ObjectId = require('mongodb').ObjectId;
let Promise = require('es6-promise').Promise;
let q = require('q');

let dbClient = require('../helpers/dbHelper');
let validator = require('../helpers/validator');

let CHART_COLLECTION = "chart_collection";
let CHART_SET_COLLECTION = "chart_set_collection";
let CHART_SET_TYPE = "chartset";

dbClient.DATABASE_KEYS.push({
  COLLECTION: CHART_SET_COLLECTION,
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
exports.create = function(data) {
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

  return db.collection(CHART_SET_COLLECTION)
    .insertOne(schema)
    .then(function (result) {
      return result.ops[0];
    });
};


exports.all = function(params) {
  let db = dbClient.get();
  let query = {};

  params = params || {};

  if (params.query) {
    query["$text"] = {
      "$search": params.query
    };

    delete params.query;
  }

  return db.collection(CHART_SET_COLLECTION)
    .find(query, false, params)
    .toArray();
};

exports.getOne = function(_id) {
  let db = dbClient.get();
  let regExp = /^s-/g;
  let query = {};
  let promiseQueue = [];

  query = { '_id': ObjectId(_id) };

  return db.collection(CHART_SET_COLLECTION).findOne(query).then(function(doc) {
    if (!doc) return null;

    doc.charts.forEach(function(chartId, index) {
      promiseQueue.push(db.collection(CHART_COLLECTION).findOne({ _id: ObjectId(chartId) }));
    });

    return q.all(promiseQueue).then(function(docs) {
      doc.charts = docs;

      return doc;
    });
  });
};

exports.clearCollection = function(callback) {
  let db = dbClient.get();

  db.collection(CHART_SET_COLLECTION).remove({}, function(err, result) {
    callback(err);
  });
};

exports.remove = function(_id, callback) {
  let db = dbClient.get();

  db.collection(CHART_SET_COLLECTION).removeOne({
    _id: ObjectId(_id)
  }, function(err, result) {
    callback(err);
  });
};

exports.updateOne = function(_id, updateData, callback) {
  let db = dbClient.get();
  let now = new Date();
  let update = {
    "$set": updateData
  };

  db.collection(CHART_SET_COLLECTION).findAndModify({
    "_id": ObjectId(_id)

  }, [], update, { new: true }, function(err, result) {
    callback(err, result);
  });
};

// TODO: update `updatedAt`
exports.removeChartFromCharts = function(_id) {
  let db = dbClient.get();
  db.collection(CHART_SET_COLLECTION).update({
    "charts": _id
  }, {
    $pullAll: {
      "charts": [_id]
    }
  });
};
