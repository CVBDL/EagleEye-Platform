/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

const schedule = require("node-schedule");
const scheduleTaskModule = require('../modules/scheduleTaskModule');
const taskCodes = require('../modules/taskCodes').getAllTasks();

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

let taskMappingTable;

function enableTask(id, taskName, cronString) {
    taskMappingTable[id] = {
        taskId: id,
        taskName: taskName,
        time: cronString,
        enable: true,
        job: schedule.scheduleJob(cronString, taskCodes[taskName])
    };
}

exports.getCodeList = function() {
    var codeNames = [];
    for (var key in taskCodes) {
        codeNames.push(key);
    }
    return codeNames;
}

exports.getTaskList = function() {
    var taskList = [];
    for (var key in taskMappingTable) {
        var job = taskMappingTable[key];

        taskList.push({
            id: job.taskId,
            name: job.taskName,
            time: job.time,
            enable: job.enable
        });
    }
    return taskList;
}

exports.enableTask = function(id) {
    if (taskMappingTable[id]) {
        enableTask(id, taskMappingTable[id].taskName, taskMappingTable[id].time);
    }
}

exports.disableTask = function(id) {
    if (taskMappingTable[id]) {
        taskMappingTable[id].job.cancel();
        taskMappingTable[id].enable = false;
        scheduleTaskModule.enableOneTask(id, false);
    }
}

exports.updateTask = function(id, taskName, cronString, enable) {
    if (taskMappingTable[id].job) {
        taskMappingTable[id].job.cancel();
    }
    taskMappingTable[id].taskName = taskName;
    taskMappingTable[id].time = cronString;
    if (enable) {
        exports.enableTask(id);
    }

    scheduleTaskModule.updateOne(id, taskName, cronString, enable);
}

exports.removeTask = function(id) {
    if (taskMappingTable[id]) {
        taskMappingTable[id].job.cancel();
        delete taskMappingTable[id];
        scheduleTaskModule.remove(taskMappingTable[id].taskId);
    }
}

exports.createTask = function(taskName, cronString) {
    scheduleTaskModule.create({
        "taskName" : taskName,
        "scheduleTimeString" : cronString,
        "enable" : true
    }, (err, result) => {
        if (err) {

        } else {
            console.log(result._id);
            enableTask(result._id, taskName, cronString);
        }
    });
}

exports.initSchedueTasks = function() {
    taskMappingTable = {};
    scheduleTaskModule.all(function (err, schedules) {
        console.log("Subscribe schedule tasks.");
        schedules.forEach(function (item, index, array) {
            if (item.enable) {
                enableTask(item._id, item.taskName, item.scheduleTimeString);
            }
        });
    });
}

