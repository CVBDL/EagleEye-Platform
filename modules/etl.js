/**
 * DB schema may be modified sometimes, use this api to adjust.
 */

'use strict';

let DB    = require('../helpers/dbHelper');
let utils = require('../helpers/utils');

let COLLECTION = "chart_collection";
let IMAGE_CHART_TYPE = "ImageChart";

/**
 * etl.start
 *
 * @desc Start ETL process in mongodb
 */
exports.start = function() {
  let db = DB.get();

  utils.getRestApiRootEndpoint().then(function(rootEndpoint) {
    db.collection(COLLECTION).find({}).forEach(function(doc) {

      // `browserDownloadUrl`
      doc.browserDownloadUrl = {
        excel: doc.chartType === IMAGE_CHART_TYPE ? null : rootEndpoint + '/download/excels/' + doc._id
      }

      // `timestamp` to `createdAt`
      if (!doc.createdAt) {
        doc.createdAt = new Date(doc.timestamp).toISOString();
      }

      delete doc.timestamp;

      // `lastUpdateTimestamp` to `updatedAt`
      if (!doc.updatedAt) {
        doc.updatedAt = new Date(doc.lastUpdateTimestamp).toISOString();
      }

      delete doc.lastUpdateTimestamp;

      db.collection(COLLECTION).save(doc);
    });
  });
};
