/**
 * Created by MMo2 on 8/18/2016.
 */
var scheduleTaskHelper = require('../helpers/scheduleTaskHelper');

var express = require('express');
var router = express.Router();

setTimeout(scheduleTaskHelper.initSchedueTasks, 5000);

router.get('/codes', function(req, res, next) {
    res.send(scheduleTaskHelper.getCodeList());
});

router.get('/tasks', function(req, res, next) {
    res.send(scheduleTaskHelper.getTaskList());
});

router.post('/newTask', function(req, res, next) {
    let id = req.body.id;
    let task = req.body.task;
    let time = req.body.time;
    let enable = req.body.enable;
    scheduleTaskHelper.create(task, time, () => {
        res.send('ok');
    });
});

router.post('/updateTask', function(req, res, next){
    let id = req.body.id;
    let task = req.body.task;
    let time = req.body.time;
    let enable = req.body.enable;
    scheduleTaskHelper.updateOneTask(id, task, time, enable);
});

module.exports = router;
