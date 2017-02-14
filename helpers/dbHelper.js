'use strict';

let MongoClient = require('mongodb').MongoClient;
let async = require('async');
let ObjectId = require('mongodb').ObjectId;

const PRODUCTION_URI = 'mongodb://localhost:27017/eagleEyeDatabase';
const TEST_URI = 'mongodb://localhost:27017/testEagleEyeDatabase';

exports.MODE_PRODUCTION = 'mode_production';
exports.MODE_TEST = 'mode_test';

exports.DATABASE_KEYS = [];

let state = {
  db: null,
  mode: null
};

let createIndex = function(keyObject, collection) {
  keyObject.keys.forEach(function(keyConfig) {
    if (keyConfig.option) {
      collection.createIndex(keyConfig.key, keyConfig.option);

    } else {
      collection.createIndex(keyConfig);
    }
  });
};

exports.connect = function(mode, done) {
  if (state.db != null) return done();

  let uri = mode === exports.MODE_TEST ? TEST_URI : PRODUCTION_URI;

  MongoClient.connect(uri, function(err, db) {
    if (err) return done(err);

    state.db = db;
    state.mode = mode;

    exports.DATABASE_KEYS.forEach(function(keyObject) {
      let collection = db.collection[keyObject.COLLECTION];
      if (!collection) {
        db.createCollection(keyObject.COLLECTION, function(err, collection) {
          createIndex(keyObject, collection);
        });
      } else {
        createIndex(keyObject, collection);
      }
    });
    done();
  })
};

exports.get = function() {
  exports.connect(exports.MODE_PRODUCTION, (err => err && console.log("Missing database connection.")));
  return state.db;
};

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null;
      state.mode = null;
      done(err);
    })
  }
};

exports.drop = function(done) {
  if (!state.db) return done();

  // This is faster then dropping the database
  state.db.collections(function(err, collections) {
    async.each(collections, function(collection, cb) {
      if (collection.collectionName.indexOf('system') === 0) {
        return cb();
      }
      collection.remove(cb);
    }, done);
  });
};

exports.fixtures = function(data, done) {
  let db = state.db;

  if (!db) {
    return done(new Error('Missing database connection.'));
  }

  let names = Object.keys(data.collections);

  async.each(names, function(name, cb) {
    db.createCollection(name, function(err, collection) {
      if (err) return cb(err);

      data.collections[name].forEach(function (item) {
        if (item._id) {
          item._id = ObjectId(item._id);
        }

        if (item.job && item.job._id) {
          item.job._id = ObjectId(item.job._id);
        }
      });

      collection.insertMany(data.collections[name], cb);
    })
  }, done);
};
