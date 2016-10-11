/**
 * Created by MMo2 on 6/14/2016.
 */
'use strict';

let ObjectId           = require('mongodb').ObjectId;

let chartOptionsHelper = require('../helpers/chart-options-helper');
let chartSets          = require('./chart-sets');
let DB                 = require('../helpers/dbHelper');
let utils              = require('../helpers/utils');

let COLLECTION = "chart_collection";
let CHART_TYPE = "chart";
let IMAGE_CHART_TYPE = "ImageChart";

DB.DATABASE_KEYS.push({
  COLLECTION: COLLECTION,
  keys: [{
    key: {
      friendlyUrl: 1
    },
    option: {
      unique: true,
      sparse: true
    }
  }, {
    "options.title": "text",
    friendlyUrl: "text",
    description: "text"
  }]
});

exports.create = function(chartData, callback) {
  let db = DB.get();
  let id = ObjectId();
  let now = new Date();

  utils.getRestApiRootEndpoint().then(function(rootEndpoint) {
    chartData._id = id;
    chartData.type = IMAGE_CHART_TYPE == chartData.chartType ? IMAGE_CHART_TYPE : CHART_TYPE;
    chartData.options = chartOptionsHelper.ChartOptionsAdapter(chartData.chartType, chartData.options);
    chartData.createdAt = chartData.updatedAt = now.toISOString();

    chartData.browserDownloadUrl = {
      excel: chartData.chartType === IMAGE_CHART_TYPE ? null : rootEndpoint + '/download/excels/' + id,
      image: null
    };

    if (!chartData.friendlyUrl) delete chartData.friendlyUrl;

    db.collection(COLLECTION).insert(chartData, function(err, result) {
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
  let regExp = /^c-/g;

  if (regExp.test(_id)) {
    db.collection(COLLECTION).find({
      "friendlyUrl": _id
    }).toArray(callback);

  } else {
    db.collection(COLLECTION).find({
      "_id": ObjectId(_id)
    }).toArray(callback);
  }
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

  if (!updateData.friendlyUrl) {
    delete updateData.friendlyUrl;
    update.$unset = {
      "friendlyUrl": ""
    };

  } else {
    update.$set.friendlyUrl = updateData.friendlyUrl;
  }

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

  if (regExp.test(_id)) {
    query = { friendlyUrl: _id }
  } else {
    query = { _id: ObjectId(_id) }
  }

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
