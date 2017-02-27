'use strict';

let express = require('express');

let task = require('../modules/task');

let router = module.exports = express.Router();


// define routes
router.route('/tasks/:id')

  // update single task state
  .put(function putTask(req, res, next) {
    let id = req.params.id;
    let state = req.body.state;

    task.update(id, { state: state })
      .then(function (doc) {
        res.send(doc);
      })
      .catch(next);
  });
