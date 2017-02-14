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

'use strict';

let ObjectId = require('mongodb').ObjectId;
let child_process = require('child_process');
let schedule = require("node-schedule");

let jobs = require('../modules/jobs');
let logs = require('../modules/logs');

// save running job configuration and handlers
let stat = {};


/**
 * Run a job immediately.
 *
 * @method
 * @param {Object} job An job config object.
 */
exports.runJob = function runJob(job) {
  let command = job.command;

  logs
    .create({
      "_id": job._id,
      "name": job.name,
      "expression": job.expression,
      "command": job.command,
    })
    .then(function (log) {
      let fullCommand = command + " --task-id=\"" + log._id + "\"";
      console.log(fullCommand);

      child_process.exec(fullCommand, function (err, stdout, stderr) {
        if (err) {
          logs.updateOne(log._id, {
            state: 'failure',
            message: err.message
          });

        } else {
          console.log(stdout);
        }
      });
    });
};


/**
 * Schedule a new job.
 *
 * @method
 * @param {Object} job An job config object.
 * @returns {Object} Job scheduling status.
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
 * Cancel and delete an scheduled job.
 *
 * @method
 * @param {string} id Job id.
 */
exports.deleteJob = function deleteJob(id) {
  if (stat[id] && stat[id].jobHandler) {
    stat[id].jobHandler.cancel();
  }

  delete stat[id];
};

/**
 * Start all scheduled jobs.
 *
 * @method
 */
exports.start = function initSchedueJobs() {
  jobs.all()
    .then(function (jobs) {
      jobs.forEach(function (job) {
        if (job.enabled === true) {
          exports.schedule(job);
        }
      });

      console.log("All scheduled jobs started.");
    });
};
