'use strict';

/**
 * @overview
 *
 * The cron expression format:
 *
 * *    *    *    *    *    *
 * ┬    ┬    ┬    ┬    ┬    ┬
 * │    │    │    │    │    |
 * │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 * │    │    │    │    └───── month (1 - 12)
 * │    │    │    └────────── day of month (1 - 31)
 * │    │    └─────────────── hour (0 - 23)
 * │    └──────────────────── minute (0 - 59)
 * └───────────────────────── second (0 - 59, OPTIONAL)
 *
 * ["node-schedule" document]{@link https://github.com/node-schedule/node-schedule}
 */

let ObjectId = require('mongodb').ObjectId;
const child_process = require('child_process');
const schedule = require("node-schedule");

const jobs = require('../modules/jobs');
const logs = require('../modules/logs');

// save running job configuration and handlers
let stat = {};

function enableJob(id, jobName, cronString, para) {
  stat[id] = {
    jobId: id,
    jobName: jobName,
    time: cronString,
    enable: true,
    para: para,
    job: schedule.scheduleJob(cronString, function() {
      logs.create({
        "_id": id,
        "name": jobName,
        "expression": cronString,
        "command": para,
      }, function(err, result) {
        console.log(para + " --task-id=\"" + result._id + "\"");
        child_process.exec(para + " --task-id=\"" + result._id + "\"", function(err, stdout, stderr) {
          if (err) {
            logs.updateOne(result._id, {
              'state': 'failure',
              'errorMessage': err.message
            }, (err, result) => (err || result));
          } else {
            console.log(stdout);
          }
        });
      })
    })
  };
}

/**
 * @method
 */
exports.runJob = function runJob(job) {
  let command = job.command;

  logs.create({
    "_id": job._id,
    "name": job.name,
    "expression": job.expression,
    "command": job.command,
  }, function (err, result) {
    console.log(para + " --task-id=\"" + result._id + "\"");

    child_process.exec(command + " --task-id=\"" + result._id + "\"", function (err, stdout, stderr) {
      if (err) {
        logs.updateOne(result._id, {
          'state': 'failure',
          'errorMessage': err.message
        }, (err, result) => (err || result));
      } else {
        console.log(stdout);
      }
    });
  });
}

/**
 * @method
 */
exports.schedule = function schedule(job) {
  let id = job._id;

  // convert ObjectId
  if (typeof id === 'object' && id !== null) {
    id = id.toHexString();
  }

  stat[id] = {};
  stat[id].job = job;
  stat[id].jobHandler = schedule.scheduleJob(expression, function () {
    exports.runJob(job);
  });

  return stat[id];
};

/**
 * @method
 */
exports.deleteJob = function deleteJob(id) {
  if (stat[id] && stat[id].jobHandler) {
    stat[id].jobHandler.cancel();
  }

  delete stat[id];
};


exports.enableJob = function(id) {
  if (stat[id]) {
    enableJob(id, stat[id].jobName, stat[id].time, stat[id].para);
  }
};

exports.disableJob = function(id) {
  if (stat[id]) {
    stat[id].job.cancel();
    stat[id].enable = false;
    jobs.enableOneJob(id, false);
  }
};

exports.updateJob = function(id, jobName, cronString, enable, para, callback) {
  if (stat[id].job) {
    stat[id].job.cancel();
  }
  stat[id].jobName = jobName;
  stat[id].time = cronString;
  stat[id].para = para;
  if (enable) {
    exports.enableJob(id);
  } else {
    exports.disableJob(id);
  }

  jobs.updateOneJob(id, jobName, cronString, enable, para, callback);
};

/**
 * @method
 */
exports.initSchedueJobs = function initSchedueJobs() {
  jobs
    .all()
    .then(function (jobs) {
      jobs.forEach(function (item, index, array) {
        enableJob(item._id, item.jobName, item.scheduleTimeString, item.para);

        if (!item.enable) {
          exports.disableJob(item._id);
        }
      });

      console.log("All scheduled jobs started.");
    });
};
