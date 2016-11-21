/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

const schedule = require("node-schedule");
const scheduleJobModule = require('../modules/scheduleJobModule');
const jobCodes = require('../modules/taskCodes').getAllTasks();
const child_process = require('child_process');  

/*------------------------------------------------------------------------------
//  The cron format
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
//----------------------------------------------------------------------------*/

let jobMappingTable;

function enableJob(id, jobName, cronString, para) {
  console.log(para);
  jobMappingTable[id] = {
    jobId: id,
    jobName: jobName,
    time: cronString,
    enable: true,
    para: para,
    job: schedule.scheduleJob(cronString, function() {
      console.log(para);
      child_process.exec(para, function(err, stdout, stderr) {
        console.log(stdout);
      })
    })
  };
}

// exports.getCodeList = function() {
//   var codeNames = [];
//   for (var key in taskCodes) {
//     codeNames.push(key);
//   }
//   return codeNames;
// };

exports.getJobList = function() {
  var jobList = [];
  for (var key in jobMappingTable) {
    var job = jobMappingTable[key];

    jobList.push({
      id: job.jobId,
      name: job.jobName,
      time: job.time,
      enable: job.enable,
      para: job.para
    });
  }
  return jobList;
};

exports.enableJob = function(id) {
  if (jobMappingTable[id]) {
    enableJob(id, jobMappingTable[id].jobName, jobMappingTable[id].time, jobMappingTable[id].para);
  }
};

exports.disableJob = function(id) {
  if (jobMappingTable[id]) {
    jobMappingTable[id].job.cancel();
    jobMappingTable[id].enable = false;
    scheduleJobModule.enableOneJob(id, false);
  }
};

exports.updateJob = function(id, jobName, cronString, enable, para, callback) {
  if (jobMappingTable[id].job) {
    jobMappingTable[id].job.cancel();
  }
  jobMappingTable[id].jobName = jobName;
  jobMappingTable[id].time = cronString;
  jobMappingTable[id].para = para;
  if (enable) {
    exports.enableJob(id);
  }

  scheduleJobModule.updateOneJob(id, jobName, cronString, enable, para, callback);
};

exports.removeJob = function(id, callback) {
  if (jobMappingTable[id]) {
    if (jobMappingTable[id].job) {
      jobMappingTable[id].job.cancel();
    }

    scheduleJobModule.remove(jobMappingTable[id].jobId, callback);
    delete jobMappingTable[id];
  }
};

exports.createJob = function(jobName, cronString, para, callback) {
  scheduleJobModule.create(
    jobName,
    cronString,
    para,
    (err, result) => {
      if (err) {

      } else {
        console.log(result._id);
        enableJob(result._id, jobName, cronString, para);
        callback();
      }
    });
};

exports.initSchedueJobs = function() {
  jobMappingTable = {};
  scheduleJobModule.all(function(err, schedules) {
    console.log("Subscribe schedule jobs.");
    schedules.forEach(function(item, index, array) {
      if (item.enable) {
        enableJob(item._id, item.jobName, item.scheduleTimeString, item.para);
      }
    });
  });
};
