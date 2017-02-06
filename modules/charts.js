'use strict';

let Promise = require('es6-promise').Promise;
let ObjectId = require('mongodb').ObjectId;

let CHART_TYPES = require('./chart-types');
let chartSets = require('./chart-sets');
let dbClient = require('../helpers/dbHelper');
let utils = require('../helpers/utils');
let columnTypes = require('../helpers/column-types');
let validator = require('../helpers/validator');
let excelHelper = require('../helpers/excelHelper');

const ROOT_ENDPOINT = utils.getRootEndpoint();
const API_ROOT_ENDPOINT = utils.getRestApiRootEndpoint();
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
 * @param {Object} data The new chart object.
 * @param {string} data.chartType The chart's type.
 * @param {?string} [data.description=null] The chart's description.
 * @param {?Object} [data.datatable=null] The chart's data table.
 * @param {?Object} [data.options=null] The chart's options.
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
      : (API_ROOT_ENDPOINT + '/download/excels/' + id);

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
 * @param {string} [params.query] Query for find operation.
 * @param {Array<Array<string>>} [params.sort] Set to sort the documents
 *                                             coming back from the query.
 * @param {number} [params.skip] Set to skip N documents ahead in your
 *                               query (useful for pagination).
 * @param {number} [params.limit] Sets the limit of documents returned in
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
 * @param {?string} [data.description] The chart description field.
 * @param {?Object} [data.datatable] The chart datatable field.
 * @param {?Object} [data.options] The chart options field.
 * @returns {Promise} A promise will be resolved with the updated chart.
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
 * Update an image chart's browserDownloadUrl.
 *
 * @method
 * @param {ObjectId} id The chart's ObjectId.
 * @param {string} filename The image filename.
 * @returns {Promise} A promise will be resolved when delete successfully.
 *                    Or rejected with defined errors.
 */
exports.updateImageBrowserDownloadUrl = function (id, filename) {
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
  
  return db.collection(COLLECTION)
    .findOneAndUpdate({
      _id: ObjectId(id)
    }, {
      $set: {
        browserDownloadUrl: {
          excel: null,
          image: ROOT_ENDPOINT + '/upload/' + filename
        },
        updatedAt: new Date().toISOString()
      }
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
 * Update a chart's data table from a .xlsx file.
 * It'll read the first worksheet of the uploaded .xlsx file.
 *
 * @method
 * @param {ObjectId} id The chart's ObjectId.
 * @param {Excel.Workbook} workbook An instance of Exceljs Workbook class.
 * @returns {Promise} A promise will be resolved with the updated chart.
 *                    Or rejected with defined errors.
 */
exports.updateDataTableFromXlsx = function (id, workbook) {
  let updateData = {
    datatable: {
      cols: [],
      rows: []
    }
  };

  // Sample of `worksheetData`:
  //[
  //  [
  //    "name(string)", "dept(string)", "lunchTime(timeofday)", "salary(number)",
  //    "hireDate(date)", "age(number)", "isSenior(boolean)",
  //    "seniorityStartTime(datetime)"
  //  ],
  //  [
  //    "John", "Eng", "12:00:00", "1000", "2005-03-19", "35", "true",
  //    "2007-12-02 15:56:00"
  //  ],
  //  [
  //    "Dave", "Eng", "13:01:30.123", "500.5", "2006-04-19", "27", "false",
  //    "2005-03-09 12:30:00.32"
  //  ],
  //  [
  //    "Sally", "Eng", "09:30:05", "600", "2005-10-10", "30", "false", "null"
  //  ]
  //]
  let worksheetData = excelHelper.readWorkbook(workbook);

  if (!worksheetData || !worksheetData.length || !worksheetData[0].length) {
    return Promise.reject({
      status: 422,
      errors: [{
        "resource": "chart",
        "field": "datatable",
        "code": "invalid"
      }]
    });
  }

  // default data type for role: 'domain'
  let defaultDomainType = 'string';

  // default data type for role: 'data'
  let defaultDataType = 'number';

  let header = worksheetData[0];

  // process headers row
  header.forEach(function (field, index) {
    updateData.datatable.cols.push({
      label: field ? field : 'Column' + index,
      type: (index === 0) ? defaultDomainType : defaultDataType
    });
  });
  
  let preferredColumnDataType = [];

  // process data rows
  worksheetData.forEach(function (fields, index) {
    if (index === 0) return;

    let row = { c: [] };

    fields.forEach(function (field, index) {
      row.c.push({
        v: columnTypes.convertFileToDataTable(field)
      });
      
      if (!preferredColumnDataType[index]) {
        let inferredType = columnTypes.infer(field);

        preferredColumnDataType[index] =
          inferredType === 'null'
            ? undefined
            : inferredType;
      }
    });

    updateData.datatable.rows.push(row);
  });

  // determine preferred data types
  preferredColumnDataType.forEach(function (type, index) {
    if (type) {
      updateData.datatable.cols[index].type = type;

    } else {
      updateData.datatable.cols[index].type =
        (index === 0)
        ? defaultDomainType
        : defaultDataType;
    }
  });

  return exports.updateOne(id, updateData);
};
