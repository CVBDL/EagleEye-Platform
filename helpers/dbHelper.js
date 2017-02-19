'use strict';

let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectId;
let Promise = require('es6-promise').Promise;

let state = {
  db: null,
  mode: null
};

/**
 * MongoDB connection string URIs.
 *
 * @constant {Object}
 */
const ENV_2_CONNECTION_URI = {
  production: 'mongodb://localhost:27017/eagleeye_prod',
  development: 'mongodb://localhost:27017/eagleeye_dev',
  test: 'mongodb://localhost:27017/eagleeye_test'
};

/**
 * Define all database collections.
 *
 * @constant {Object}
 */
const COLLECTION = exports.COLLECTION = {
  CHART: 'chart',
  CHART_SET: 'chart_set',
  JOB: 'job',
  TASK: 'task'
};


/**
 * MongoDB indexes settings.
 * Make use of 'text' indexes to support query functionality.
 * {@link https://docs.mongodb.com/manual/indexes/}
 * {@link https://docs.mongodb.com/manual/core/index-text/#index-feature-text}
 *
 * @constant {Object}
 */
const INDEX = {
  CHART: {
    "options.title": "text",
    "description": "text"
  },
  CHART_SET: {
    title: "text",
    description: "text"
  }
};

/**
 * Create all required collections.
 *
 * @method
 * @param {Db} The connected database.
 * @returns {Promise} A promise resolve with Db.
 */
let createCollections = function createCollections(db) {
  let promiseList = [];

  Object.keys(COLLECTION).forEach(function (key) {
    let collectionName = COLLECTION[key];
    let resultPromise = db.createCollection(collectionName);

    promiseList.push(resultPromise);
  });

  return Promise
    .all(promiseList)
    .then(function () {
      return db;
    });
};

/**
 * Create database indexes.
 *
 * @method
 * @param {Db} The connected database.
 * @returns {Promise} A promise resolve with Db.
 */
let createIndexes = function createIndexes(db) {
  let promiseList = [];

  Object.keys(INDEX).forEach(function (key) {
    let collectionName = COLLECTION[key];
    let indexSpec = INDEX[key];
    let resultPromise = db.createIndex(collectionName, indexSpec);

    promiseList.push(resultPromise);
  });

  return Promise
    .all(promiseList)
    .then(function () {
      return db;
    });
};

/**
 * Connect to database.
 *
 * @method
 * @returns {Promise}
 */
exports.connect = function connect() {
  let mode = process.env.NODE_ENV;
  let uri = ENV_2_CONNECTION_URI[mode]
            ? ENV_2_CONNECTION_URI[mode]
            : ENV_2_CONNECTION_URI['development'];

  if (state.db && state.mode === mode) {
    return Promise.resolve(state.db);
  }

  return MongoClient.connect(uri)
    .then(createCollections)
    .then(createIndexes)
    .then(function (db) {
      state.db = db;
      state.mode = mode;
    })
    .catch(function (err) {
      console.log(err);
    });
};

/**
 * Drop collections.  For test use.
 *
 * @method
 * @returns {Promise}
 */
exports.drop = function drop() {
  let db = state.db;

  if (!db) {
    return Promise.reject('No database connection.');
  }

  let promiseList = [];

  Object.keys(COLLECTION).forEach(function (key) {
    let collectionName = COLLECTION[key];
    let resultPromise = db.collection(collectionName).deleteMany({});

    promiseList.push(resultPromise);
  });

  return Promise
    .all(promiseList)
    .then(function () {
      return db;
    });
};

/**
 * Drop collections.  For test use.
 *
 * @method
 * @param {Object} data Fixtures data.
 * @returns {Promise} A promise resolve with Db.
 */
exports.fixtures = function(data) {
  let db = state.db;

  if (!db) {
    return Promise.reject('No database connection.');
  }

  let promiseList = [];
  let collectionNames = Object.keys(data.collections);

  collectionNames.forEach(function (collectionName) {
    let records = data.collections[collectionName];

    records.forEach(function (record) {
      if (record._id) {
        record._id = ObjectId(record._id);
      }

      if (record.job && record.job._id) {
        record.job._id = ObjectId(record.job._id);
      }
    });

    let resultPromise = db.collection(collectionName).insertMany(records);
    promiseList.push(resultPromise);
  });

  return Promise
    .all(promiseList)
    .then(function () {
      return db;
    });
};
