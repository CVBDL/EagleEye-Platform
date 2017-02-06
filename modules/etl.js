/**
 * DB schema may be modified sometimes, use this api to adjust.
 */

'use strict';

let DB    = require('../helpers/dbHelper');
let utils = require('../helpers/utils');

let CHART_COLLECTION = 'chart_collection';
let CHART_SET_COLLECTION = 'chart_set_collection';
let IMAGE_CHART_TYPE = 'ImageChart';

/**
 * etl.start
 *
 * @desc Start ETL process in mongodb
 */
exports.start = function() {
  let db = DB.get();

  /*****************************************************************************
   *  CHART COLLECTION
   ****************************************************************************/
  let rootEndpoint = utils.getRootEndpoint();

  db.collection(CHART_COLLECTION).find({}).forEach(function (doc) {

    if (!doc.browserDownloadUrl) {
      doc.browserDownloadUrl = {};
    }

    // `browserDownloadUrl`
    if (doc.chartType !== IMAGE_CHART_TYPE) {
      doc.browserDownloadUrl.excel = rootEndpoint + '/api/v1/download/excels/' + doc._id;
      doc.browserDownloadUrl.image = null;

    } else {
      if (!doc.browserDownloadUrl.image && doc.image_file_name) {
        doc.browserDownloadUrl.image = rootEndpoint + '/upload/' + doc.image_file_name;

      }
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

    db.collection(CHART_COLLECTION).save(doc);
  });


  /*****************************************************************************
   *  CHART SET COLLECTION
   ****************************************************************************/
  db.collection(CHART_SET_COLLECTION).find({}).forEach(function(doc) {
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

    db.collection(CHART_SET_COLLECTION).save(doc);
  });

};
