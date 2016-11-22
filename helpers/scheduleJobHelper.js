/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

const schedule = require("node-schedule");
const scheduleJobModule = require('../modules/scheduleJobModule');
// const jobCodes = require('../modules/taskCodes').getAllTasks();
const child_process = require('child_process');
const scheduleJobLogModule = require('../modules/scheduleJobLogModule');

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
  // console.log(para);
  jobMappingTable[id] = {
    jobId: id,
    jobName: jobName,
    time: cronString,
    enable: true,
    para: para,
    job: schedule.scheduleJob(cronString, function() {
      scheduleJobLogModule.create({
        "_id": id,
        "name": jobName,
        "expression": cronString,
        "command": para,
      }, function(err, result) {
        console.log(para + " " + result._id);
        child_process.exec(para + " " + result._id, function(err, stdout, stderr) {
          if (err) {
            scheduleJobLogModule.updateOne(result._id, {
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

exports.getJob = function(id) {
  if (!jobMappingTable[id]) {
    return null
  }
  var job = jobMappingTable[id];
  return {
      id: job.jobId,
      name: job.jobName,
      time: job.time,
      enable: job.enable,
      para: job.para
    };
};

exports.triggerJob = function(id) {
  scheduleJobModule.getOne(id, function(err, docs) {
    scheduleJobLogModule.create({
      "_id": docs[0]._id,
      "name": docs[0].jobName,
      "expression": docs[0].scheduleTimeString,
      "command": docs[0].para,
    }, function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(docs[0].para + " " + result._id);
      child_process.exec(docs[0].para + " " + result._id, function(err, stdout, stderr) {
        if (err) {
          scheduleJobLogModule.updateOne(result._id, {
            'state': 'failure',
            'errorMessage': err.message
          }, (err, result) => (err || result));
        } else {
          console.log(stdout);
        }
      });
    });
  });
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
  } else {
    exports.disableJob(id);
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
        callback(err);
      } else {
        // console.log(result._id);
        enableJob(result._id, jobName, cronString, para);
        callback(null, result);
      }
    });
};

exports.initSchedueJobs = function() {
  jobMappingTable = {};
  scheduleJobModule.all(function(err, schedules) {
    console.log("Subscribe schedule jobs.");
    schedules.forEach(function(item, index, array) {
      enableJob(item._id, item.jobName, item.scheduleTimeString, item.para);
      if (!item.enable) {
        exports.disableJob(item._id);
      }
    });
  });
};
