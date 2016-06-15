/**
 * Created by MMo2 on 6/15/2016.
 */
var express = require('express');
var router = express.Router();

var chartModule = require('../modules/chartModule');

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
    var id = req.params.id;
    console.log(id);
    chartModule.getOne(id, function(err, docs) {
        console.log(docs);
       res.send(docs[0]);
    });
});

module.exports = router;