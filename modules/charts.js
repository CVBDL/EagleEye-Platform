'use strict';

let Promise = require('es6-promise').Promise;
let ObjectId = require('mongodb').ObjectId;

let chartSets = require('./chart-sets');
let chartOptionsHelper = require('../helpers/chart-options-helper');
let dbClient = require('../helpers/dbHelper');
let utils = require('../helpers/utils');
let columnTypes = require('../helpers/column-types');
let validator = require('../helpers/validator');
let CHART_TYPES = require('../modules/chart-types');

const ROOT_ENDPOINT = utils.getRestApiRootEndpoint();
const COLLECTION = "chart_collection";

dbClient.DATABASE_KEYS.push({
  COLLECTION: COLLECTION,
  keys: [{
    "options.title": "text",
    description: "text"
  }]
});


/**
 * Create a new chart.
 *
 * @method
 * @param {Object} data  The new chart object.
 * @returns {Promise} A promise will be resolved with new created chart.
 *                    Or rejected with defined errors.
 */
exports.create = function(data) {
  let db = dbClient.get();
  
  // chart schema
  let schema = {
    _id: null,
    chartType: null,
    description: null,
    datatable: null,
    options: null,
    browserDownloadUrl: {
      excel: null,
      image: null
    },
    createdAt: null,
    updatedAt: null
  };

  const id = ObjectId();

  schema._id = id;

  if (validator.isValidChartType(data.chartType)) {
    schema.chartType = data.chartType;

  } else {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "chart",
        "field": "chartType",
        "code": "missing_field"
      }]
    });
  }

  schema.browserDownloadUrl.excel =
    (data.chartType === CHART_TYPES.ImageChart)
      ? null
      : (ROOT_ENDPOINT + '/download/excels/' + id);

  if (validator.isValidDescription(data.description)) {
    schema.description = data.description;
  }

  if (validator.isValidDataTable(data.datatable)) {
    schema.datatable = data.datatable;
  }

  if (validator.isValidOptions(data.options)) {
    schema.options = data.options;
  }

  schema.createdAt = schema.updatedAt = new Date().toISOString();

  return db.collection(COLLECTION)
    .insertOne(schema)
    .then(function (result) {
      return result.ops[0];
    });
};


/**
 * List all charts.
 *
 * @method
 * @param {Object} params URL query parameters.
 * @param {Object} [params.query] Query for find operation.
 * @param {Object} [params.sort] Set to sort the documents coming back
 *                               from the query.
 * @param {Object} [params.skip] Set to skip N documents ahead in your
 *                               query (useful for pagination).
 * @param {Object} [params.limit] Sets the limit of documents returned in
 *                                the query.
 * @returns {Promise} A promise will be resolved with new created chart.
 *                    Or rejected with defined errors.
 */
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

  return db.collection(COLLECTION)
    .find(query, false, params)
    .toArray();
};


/**
 * Get a single chart.
 *
 * @method
 * @param {ObjectId} id The chart's ObjectId.
 * @returns {Promise} A promise will be resolved with the found chart.
 *                    Or rejected with defined errors.
 */
exports.getOne = function(id) {
  let db = dbClient.get();

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

  return db.collection(COLLECTION)
    .find({ "_id": ObjectId(id) })
    .limit(1)
    .toArray();
};


/**
 * Delete all charts.
 *
 * @method
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected when error occurred.
 */
exports.deleteAll = function() {
  let db = dbClient.get();

  return db.collection(COLLECTION).deleteMany();
};


/**
 * Delete a single chart.
 *
 * @method
 * @param {ObjectId} id The chart's ObjectId.
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected with defined errors.
 */
exports.deleteOne = function(id) {
  let db = dbClient.get();
  
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

  return db.collection(COLLECTION)
    .deleteOne({ _id: ObjectId(id) })
    .then(function (result) {
      if (result.deletedCount === 0) {
        return Promise.reject({
          status: 404
        });

      } else {
        chartSets.removeChartFromCharts(id);

        return result;
      }
    });
};


/**
 * Update a single chart.
 *
 * @method
 * @param {ObjectId} id The chart's ObjectId.
 * @param {Object} data The updated chart data object.
 * @param {Object} [data.description] The chart description field.
 * @param {Object} [data.datatable] The chart datatable field.
 * @param {Object} [data.options] The chart options field.
 * @returns {Promise} A promise will be resolved when delete successfully.
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

  let db = dbClient.get();
  let fields = ['description', 'datatable', 'options'];
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
      // the original.The default is true.
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


exports.updateImageChartFile = function(_id, fileName, callback) {
  let db = dbClient.get();
  let now = new Date();
  let regExp = /^c-/g;
  let query = {};
  let rootEndpoint = utils.getRootEndpoint();

  query = { _id: ObjectId(_id) }

  db.collection(COLLECTION).findOneAndUpdate(query, {
    $set: {
      browserDownloadUrl: {
        excel: null,
        image: rootEndpoint + '/uploadChartImages/' + fileName  // TODO: make path configurable
      },
      updatedAt: now.toISOString()
    }
  }, callback);
};


exports.updateDataTableBy2dArray = function(_id, data, done) {
  let defaultDomainType = 'string';
  let defaultDataType = 'number';

  let updateData = {};

  // response if data table is empty
  if (typeof data === 'undefined' || data.length === 0) {
    done({
      message: 'Data table has no data.'
    });
  }

  let firstRow = data[0];

  updateData.datatable = {
    "cols": [{
      "type": defaultDomainType,
      "label": firstRow[0] || ''
    }],
    "rows": []
  };

  if (data.length === 1) {
    for (let i = 1; i < firstRow.length; i++) {
      updateData.datatable.cols.push({
        "label": firstRow[i],
        "type": defaultDataType
      });
    }

  } else {
    updateData.datatable.cols[0].type = columnTypes.infer(data[1][0]);

    for (let i = 1; i < firstRow.length; i++) {
      updateData.datatable.cols.push({
        "label": firstRow[i],
        "type": "number"
      });
    }
    for (let i = 1; i < data.length; i++) {
      let row = {
        c: []
      };
      for (let j = 0; j < firstRow.length; j++) {
        row.c.push({
          v: data[i][j]
        });
      }
      updateData.datatable.rows.push(row);
    }
  }
  console.log(updateData)
  this.updateOne(_id, updateData, done);
};


exports.updateDataTable = function(_id, data, done) {
  this.updateOne(_id, { datatable: data }, done);
};
