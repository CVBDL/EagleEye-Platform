'use strict';

let express = require('express');

let scheduler = require('../helpers/scheduler');
let utils = require('../helpers/utils');
let jobs = require('../modules/jobs');
let logs = require('../modules/logs');

let router = module.exports = express.Router();


// define routes
router.route('/jobs')

  // list all jobs
  .get(function getJobs(req, res) {
    jobs.all()
      .then(function (docs) {
        res.send(docs);
      })
      .catch(next);
  })

  // create a job
  .post(function postJobs(req, res) {
    jobs.create(req.body)
      .then(function (doc) {
        res.send(doc);
      })
      .catch(next);
  });


// define routes
router.route('/jobs/:id')

  // get a single job
  .get(function getJob(req, res) {
    let id = req.params.id;

    jobs.getOne(id)
      .then(function (docs) {
        res.send(docs[0]);
      })
      .catch(next);
  })

  // delete a job
  .delete(function deleteJob(req, res) {
    let id = req.params.id;

    jobs.deleteOne(id)
      .then(function () {
        res.status(204).send();
      })
      .catch(next);
  });


// define routes
router.route('/jobs/:id/restart')

  // restart a job
  .put(function putJobRestart(req, res) {
    let id = req.params.id;

    jobs.getOne(id)
      .then(function (docs) {
        scheduler.runJob(docs[0]);
      })
      .then(function () {
        res.status(204).send();
      })
      .catch(next);
  });


// define routes
router.route('/jobs/:id/tasks')

  // read a job's all tasks
  .get(function getJobTasks(req, res) {
    let id = req.params.id;

    logs.getAllByJobId(id)
      .then(function (docs) {
        docs.sort((a, b) => b.finishedAt - a.finishedAt);
        res.send(docs);
      })
      .catch(next);
  });
