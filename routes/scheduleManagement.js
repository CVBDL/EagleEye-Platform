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

module.exports = router;
