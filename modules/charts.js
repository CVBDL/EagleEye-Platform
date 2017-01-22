'use strict';

let ObjectId = require('mongodb').ObjectId;

let chartOptionsHelper = require('../helpers/chart-options-helper');
let chartSets          = require('./chart-sets');
let DB                 = require('../helpers/dbHelper');
let utils              = require('../helpers/utils');
let columnTypes        = require('../helpers/column-types');

const COLLECTION = "chart_collection";
const CHART_TYPE = "chart";
const IMAGE_CHART_TYPE = "ImageChart";

DB.DATABASE_KEYS.push({
  COLLECTION: COLLECTION,
  keys: [{
    "options.title": "text",
    description: "text"
  }]
});

exports.create = function(chartData, callback) {
  const db = DB.get();
  const id = ObjectId();

  utils.getRestApiRootEndpoint().then(function(rootEndpoint) {
    chartData._id = id;

    chartData.options = chartOptionsHelper.ChartOptionsAdapter(
      chartData.chartType,
      chartData.options
    );

    chartData.createdAt = chartData.updatedAt = new Date().toISOString();

    chartData.browserDownloadUrl = {
      excel: chartData.chartType === IMAGE_CHART_TYPE ?
                              null : rootEndpoint + '/download/excels/' + id,
      image: null
    };

    db.collection(COLLECTION).insertOne(chartData, function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result.ops[0]);
    });
  });
};

exports.all = function(option, callback) {
  let db = DB.get();
  let query = {};
  if (arguments.length == 1) {
    callback = option;
    option = {};
  }
  if (option.skip) {
    option.skip--;
  }
  if (option.query) {
    query["$text"] = {
      "$search": option.query
    };
    delete option.query;
  }
  db.collection(COLLECTION).find(query, false, option).toArray(callback);
};

exports.getOne = function(_id, callback) {
  let db = DB.get();

  db.collection(COLLECTION).find({
    "_id": ObjectId(_id)
  }).toArray(callback);
};

exports.clearCollection = function(callback) {
  let db = DB.get();

  db.collection(COLLECTION).remove({}, function(err, result) {
    callback(err);
  });
};

exports.remove = function(_id, callback) {
  let db = DB.get();
  db.collection(COLLECTION).removeOne({
    _id: ObjectId(_id)
  }, function(err, result) {
    callback(err);
    chartSets.removeChartFromCharts(_id);
  });
};

exports.updateOne = function(_id, updateData, callback) {
  let db = DB.get();
  let now = new Date();
  let update = {
    "$set": updateData
  };

  updateData.updatedAt = now.toISOString();

  db.collection(COLLECTION).findAndModify({
    _id: ObjectId(_id)

  }, [], update, { new: true }, function(err, result) {
    callback(err, result);
  });
};

exports.updateImageChartFile = function(_id, fileName, callback) {
  let db = DB.get();
  let now = new Date();
  let regExp = /^c-/g;
  let query = {};

  query = { _id: ObjectId(_id) }

  utils.getRootEndpoint().then(function(rootEndpoint) {
    db.collection(COLLECTION).findOneAndUpdate(query, {
      $set: {
        browserDownloadUrl: {
          excel: null,
          image: rootEndpoint + '/uploadChartImages/' + fileName  // TODO: make path configurable
        },
        updatedAt: now.toISOString()
      }
    }, callback);
  })
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
