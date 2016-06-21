/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let express = require('express');
let router = express.Router();

let chartModule = require('../modules/chartModule');

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
        res.send("OK.");
    });
});

router.get('/v1/charts/:id', function(req, res, next) {
    let id = req.params.id;

    chartModule.getOne(id, function(err, docs) {
        console.log(docs);
       res.send(docs[0]);
    });
});

module.exports = router;
