'use strict';

let express = require('express');

let scheduleJobHelper = require('../helpers/scheduleJobHelper');
let utils             = require('../helpers/utils');
let jobLog            = require('../modules/scheduleJobLogModule');

let router = module.exports = express.Router();


// define routes
router.route('/jobs')

  // read all jobs
  .get(function getJobs(req, res) {
    res.send(scheduleJobHelper.getJobList().map(function (x) {
      return {
        "_id": x.id,
        "name": x.name,
        "expression": x.time,
        "command": x.para,
        "enabled": x.enable,
      };
    }));
  })

  // create a job
  .post(function postJobs(req, res) {
    let job = req.body.name;
    let time = req.body.expression;
    let para = req.body.command;

    scheduleJobHelper.createJob(job, time, para, (err, doc) => {
      if (err) {
        res.status(500).send('');
      } else {
        res.send({
          '_id': doc._id,
          'name': doc.jobName,
          'expression': doc.scheduleTimeString,
          'command': doc.para,
          'enable': doc.enable
        });
      }
    });
  });


// define routes
router.route('/jobs/:id')

  // get a single job
  .get(function getJob(req, res) {
    let id = req.params.id;
    let job = scheduleJobHelper.getJob(id);

    if (job) {
      res.send(job);
    } else {
      res.send({errorMessage: 'Job ' + id  + ' not found'});
    }
  })

  // delete a job
  .delete(function deleteJob(req, res) {
    let id = req.params.id;

    scheduleJobHelper.removeJob(id, function(err, result) {
      if (err) {
        res.status(500).send('');
      } else {
        res.send('ok');
      }
    });
  });


// define routes
router.route('/jobs/:id/restart')

  // restart a job
  .put(function putJobRestart(req, res) {
    let id = req.params.id;

    scheduleJobHelper.triggerJob(id);
    res.send('ok');
  });


// define routes
router.route('/jobs/:id/tasks')

  // read a job's all tasks
  .get(function getJobTasks(req, res) {
    let id = req.params.id;

    jobLog.getLogsByJob(id, function(err, docs) {
      docs.sort((a, b) => b.finishedAt - a.finishedAt);
      res.send(docs);
    });
  });
