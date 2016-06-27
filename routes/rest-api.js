/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let express = require('express');
let router = express.Router();

let chartModule = require('../modules/chartModule');
let chartSetModule = require('../modules/chartSetModule');

// CHART ROUTES

router.post('/v1/charts', function(req, res, next) {
    chartModule.create(req.body, function(err, result) {
        res.send(result);
    });
});

router.get('/v1/charts', function(reg, res, next) {
    chartModule.all(function(err, docs) {
        res.send(docs);
    });
});

router.get('/v1/charts/clear', function(reg, res, next) {
    chartModule.clearCollection(function(err, result) {
        res.send("success");
    });
});

router.get('/v1/charts/:id', function(req, res, next) {
    let id = req.params.id;

    chartModule.getOne(id, function(err, docs) {
        console.log(docs);
       res.send(docs[0]);
    });
});

router.delete('/v1/charts/:id', function(req, res, next) {
    let id = req.params.id;

    chartModule.remove(id, function(err, result) {
       console.log("Delete one chart,Result is:" + result);
       res.send(result);
    });
});


// CHART SET ROUTES

router.post('/v1/chart-sets', function(req, res, next) {
    chartSetModule.create(req.body, function(err, result) {
        res.send(result);
    });
});

router.get('/v1/chart-sets', function(reg, res, next) {
    chartSetModule.all(function(err, docs) {
        res.send(docs);
    });
});

router.get('/v1/chart-sets/:id', function(req, res, next) {
    let id = req.params.id;

    chartSetModule.getOne(id, function(err, docs) {
        console.log(docs);
       res.send(docs[0]);
    });
});

router.get('/v1/chart-sets/clear', function(reg, res, next) {
    chartSetModule.clearCollection(function(err, result) {
        res.send("success");
    });
});

router.delete('/v1/chart-sets/:id', function(req, res, next) {
    let id = req.params.id;

    chartSetModule.remove(id, function(err, result) {
       console.log("Delete one chart-set,Result is:" + result);
       res.send(result);
    });
});

router.put('/v1/chart-sets/:id', function(req, res, next) {
    let id = req.params.id;
    console.log("JoryTest" + id);
    console.log(req.body);
    chartSetModule.updateOne(id,req.body, function(err, result) {
       console.log("Update one chart-set,Result is:" + result);
       res.send(result);
    });
});

module.exports = router;
