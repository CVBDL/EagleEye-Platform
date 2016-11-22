/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

var scheduleJobHelper = require('../helpers/scheduleJobHelper');

var express = require('express');
var router = express.Router();

setTimeout(scheduleJobHelper.initSchedueJobs, 3000);

router.get('/jobmanage', function(req, res, next) {
  res.render('cron', {
    title: 'Schedule job management',
    jobs: scheduleJobHelper.getJobList()
    // codes: scheduleJobHelper.getCodeList()
  });
});

// router.get('/codes', function(req, res, next) {
//   res.send(scheduleJobHelper.getCodeList());
// });

router.get('/Jobs', function(req, res, next) {
  res.send(scheduleJobHelper.getJobList());
});

router.post('/newJob', function(req, res, next) {
  let job = req.body.job;
  let time = req.body.time;
  let para = req.body.para;
  scheduleJobHelper.createJob(job, time, para, () => {
    res.send('ok');
  });
});

router.post('/removeJob', function(req, res, next) {
  let id = req.body.id;
  scheduleJobHelper.removeJob(id, () => {
    res.send('ok');
  });
});

router.post('/updateJob', function(req, res, next) {
  let id = req.body.id;
  let job = req.body.job;
  let time = req.body.time;
  let enable = req.body.enable == 'true' || req.body.enable == true ? true : false;
  let para = req.body.para;
  scheduleJobHelper.updateJob(id, job, time, enable, para, () => {
    res.send('ok');
  });
});

module.exports = router;
