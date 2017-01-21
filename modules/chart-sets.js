/**
 * Created by MMo2 on 6/14/2016.
 */
'use strict';

let ObjectId = require('mongodb').ObjectId;
let q        = require('q');

let DB = require('../helpers/dbHelper');

let COLLECTION = "chart_set_collection";
let CHART_COLLECTION = "chart_collection";
let CHART_SET_TYPE = "chartset";

DB.DATABASE_KEYS.push({
  COLLECTION: COLLECTION,
  keys: [{
    "options.title": "text",
    description: "text"
  }]
});

exports.create = function(chartSetData, callback) {
  let db = DB.get();
  let now = new Date();

  chartSetData.type = CHART_SET_TYPE;
  chartSetData.createdAt = chartSetData.updatedAt = now.toISOString();

  db.collection(COLLECTION).insert(chartSetData, function(err, result) {
    if (err) {
      return callback(err, result);
    }

    callback(null, result.ops[0]);
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
      "$search": "" + option.query
    };
    delete option.query;
  }
  db.collection(COLLECTION).find(query, false, option).toArray(callback);
};

exports.getOne = function(_id) {
  let db = DB.get();
  let regExp = /^s-/g;
  let query = {};
  let promiseQueue = [];

  query = { '_id': ObjectId(_id) };

  return db.collection(COLLECTION).findOne(query).then(function(doc) {
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
  });
};

exports.updateOne = function(_id, updateData, callback) {
  let db = DB.get();
  let now = new Date();
  let update = {
    "$set": updateData
  };

  db.collection(COLLECTION).findAndModify({
    "_id": ObjectId(_id)

  }, [], update, { new: true }, function(err, result) {
    callback(err, result);
  });
};

// TODO: update `updatedAt`
exports.removeChartFromCharts = function(_id) {
  let db = DB.get();
  db.collection(COLLECTION).update({
    "charts": _id
  }, {
    $pullAll: {
      "charts": [_id]
    }
  });
};
