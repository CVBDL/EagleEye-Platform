/**
 * Created by MMo2 on 8/18/2016.
 */
'use strict';

var scheduleTaskHelper = require('../helpers/scheduleTaskHelper');

var express = require('express');
var router = express.Router();

setTimeout(scheduleTaskHelper.initSchedueTasks, 3000);

router.get('/taskmanage', function(req, res, next) {
    res.render('cron', { title: 'Schedule task management', tasks: scheduleTaskHelper.getTaskList(), codes: scheduleTaskHelper.getCodeList() });
});

router.get('/codes', function(req, res, next) {
    res.send(scheduleTaskHelper.getCodeList());
});

router.get('/tasks', function(req, res, next) {
    res.send(scheduleTaskHelper.getTaskList());
});

router.post('/newTask', function(req, res, next) {
    let task = req.body.task;
    let time = req.body.time;
    let para = req.body.para;
    scheduleTaskHelper.createTask(task, time, para, () => {
        res.send('ok');
    });
});

router.post('/removeTask', function(req, res, next) {
    let id = req.body.id;
    scheduleTaskHelper.removeTask(id, () => {
        res.send('ok');
    });
});

router.post('/updateTask', function(req, res, next){
    let id = req.body.id;
    let task = req.body.task;
    let time = req.body.time;
    let enable = req.body.enable;
    let para = req.body.para;
    scheduleTaskHelper.updateTask(id, task, time, enable, para, () => {
        res.send('ok');
    });
});

module.exports = router;
