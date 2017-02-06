'use strict';

let express = require('express');

let errHandler = require('../helpers/error-handlers');
let utils = require('../helpers/utils');
let jobLog = require('../modules/scheduleJobLogModule');

let router = module.exports = express.Router();


// define routes
router.route('/tasks/:id')

  // update single task state
  .put(function putTask(req, res) {
    let id = req.params.id;
    let state = req.body.state;

    jobLog.updateOne(id, {'state': state}, function(err, doc) {
      return err ? errHandler.handleInternalServerError(err, req, res) : res.send(doc);
    });
  });
