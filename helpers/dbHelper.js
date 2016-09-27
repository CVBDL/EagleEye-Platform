/**
 * Created by MMo2 on 6/14/2016.
 */
var MongoClient = require('mongodb').MongoClient,
  async = require('async');

var PRODUCTION_URI = 'mongodb://localhost:27017/eagleEyeDatabase',
  TEST_URI = 'mongodb://localhost:27017/testEagleEyeDatabase';

exports.MODE_TEST = 'mode_test'
exports.MODE_PRODUCTION = 'mode_production'

exports.DATABASE_KEYS = [];

var state = {
  db: null,
  mode: null,
}

var ensureIndex = function(keyObject, collection) {
  keyObject.keys.forEach(function(keyConfig) {
    if (keyConfig.option) {
      collection.ensureIndex(keyConfig.key, keyConfig.option);

    } else {
      collection.ensureIndex(keyConfig);
    }
  });
};

exports.connect = function(mode, done) {
  if (state.db != null) return done();
  var uri = mode === exports.MODE_TEST ? TEST_URI : PRODUCTION_URI

  MongoClient.connect(uri, function(err, db) {
    if (err) return done(err)
    state.db = db;
    state.mode = mode;
    exports.DATABASE_KEYS.forEach(function(keyObject) {
      var collection = db.collection[keyObject.COLLECTION];
      if (!collection) {
        db.createCollection(keyObject.COLLECTION, function(err, collection) {
          ensureIndex(keyObject, collection);
        });
      } else {
        ensureIndex(keyObject, collection);
      }
    });
    done()
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
  if (!state.db) return done()
    // This is faster then dropping the database
  state.db.collections(function(err, collections) {
    async.each(collections, function(collection, cb) {
      if (collection.collectionName.indexOf('system') === 0) {
        return cb()
      }
      collection.remove(cb)
    }, done)
  })
};

exports.fixtures = function(data, done) {
  var db = state.db;
  if (!db) {
    return done(new Error('Missing database connection.'))
  }

  var names = Object.keys(data.collections);

  async.each(names, function(name, cb) {
    db.createCollection(name, function(err, collection) {
      if (err) return cb(err);
      collection.insert(data.collections[name], cb);
    })
  }, done);
};
