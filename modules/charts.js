'use strict';

let ObjectId = require('mongodb').ObjectId;
let Promise = require('es6-promise').Promise;

let CHART_TYPES = require('./chart-types');
let chartSets = require('./chart-sets');
let fileParser = require('./file-parser');
let dbClient = require('../helpers/dbHelper');
let utils = require('../helpers/utils');
let columnTypes = require('../helpers/column-types');
let validators = require('../helpers/validators');

const ROOT_ENDPOINT = utils.getRootEndpoint();
const API_ROOT_ENDPOINT = utils.getRestApiRootEndpoint();
const COLLECTION = dbClient.COLLECTION.CHART;


/**
 * List all charts.
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
 * @returns {Promise} A promise will be resolved with charts list.
 *                    Or rejected with defined errors.
 */
exports.list = function(params) {
  let query = {};

  params = params || {};

  if (params.query) {
    query["$text"] = {
      "$search": params.query
    };

    delete params.query;
  }

  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .find(query, false, params)
      .toArray();
  });
};


/**
 * Get a single chart.
 *
 * @method
 * @param {string} id The chart's '_id' property.
 * @returns {Promise} A promise will be resolved with the found chart.
 *                    Or rejected with defined errors.
 */
exports.get = function(id) {
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
 * Create a new chart.
 *
 * @method
 * @param {Object} data The new chart object.
 * @param {string} data.chartType The chart's type.
 * @param {?string} [data.description=null] The chart's description.
 * @param {?Object} [data.datatable=null] The chart's data table.
 * @param {?Object} [data.options=null] The chart's options.
 * @returns {Promise} A promise will be resolved with new created chart.
 *                    Or rejected with defined errors.
 */
exports.create = function (data) {
  // chart schema
  let schema = {
    chartType: null,
    description: null,
    datatable: null,
    options: null,
    browserDownloadUrl: {
      image: null
    },
    createdAt: null,
    updatedAt: null
  };

  if (validators.isValidChartType(data.chartType)) {
    schema.chartType = data.chartType;

  } else {
    return Promise.reject({
      status: 422,
      errors: [{
        resource: "chart",
        field: "chartType",
        code: "missing_field"
      }]
    });
  }

  if (validators.isValidDescription(data.description)) {
    schema.description = data.description;
  }

  if (validators.isValidDataTable(data.datatable)) {
    schema.datatable = data.datatable;
  }

  if (validators.isValidOptions(data.options)) {
    schema.options = data.options;
  }

  schema.createdAt = schema.updatedAt = new Date().toISOString();

  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .insertOne(schema)
      .then(function (result) {
        return result.ops[0];
      });
  });
};


/**
 * Update a single chart.
 *
 * @method
 * @param {string} id The chart '_id' property.
 * @param {Object} data The updated chart data object.
 * @param {?string} [data.description] The chart description field.
 * @param {?Object} [data.datatable] The chart datatable field.
 * @param {?Object} [data.options] The chart options field.
 * @returns {Promise} A promise will be resolved with the updated chart.
 *                    Or rejected with defined errors.
 */
exports.update = function (id, data) {
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

  let fields = ['description', 'datatable', 'options'];
  let updateData = {
    updatedAt: new Date().toISOString()
  };

  fields.forEach(function (field) {
    if (validators.isDefined(data[field])) {
      updateData[field] = data[field];
    }
  });

  if (validators.isDefined(data.browserDownloadUrl) &&
    validators.isDefined(data.browserDownloadUrl.image)) {

    let filename = data.browserDownloadUrl.image;

    updateData.browserDownloadUrl = {
      image: ROOT_ENDPOINT + '/upload/' + filename
    };
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
 * Delete a single chart.
 *
 * @method
 * @param {string} id The chart '_id' property.
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected with defined errors.
 */
exports.delete = function (id) {
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
          return chartSets.deleteChartInChartSets(id)
            .then(function () {
              return result;
            });
        }
      });
  });
};


/**
 * Delete all charts.
 *
 * @method
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected when error occurred.
 */
exports.deleteAll = function () {
  return dbClient.connect().then(function (db) {

    return db
      .collection(COLLECTION)
      .deleteMany();
  });
};
