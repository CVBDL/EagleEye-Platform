/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let express = require('express');
let router = express.Router();

let chartModule = require('../modules/chartModule');
let chartSetModule = require('../modules/chartSetModule');

function getChartParameter(req) {
    let para = {};
    ["sort", "order", "limit", "start", "q"].forEach((key) => (req.query[key] ? (para[key] = isNaN(req.query[key]) ? req.query[key] : parseInt(req.query[key])) : null));
    let queryOption = {};

    if (!para.sort || !new Set(["timestamp", "lastUpdateTimestamp", "chartType"]).has(para.sort)) {
        para.sort = "timestamp";
    }
    if (!para.order || !new Set(["asc", "desc"]).has(para.order.toLowerCase())) {
        para.order = "desc";
    }
    queryOption.sort = [];
    queryOption.sort.push([para.sort, para.order.toLowerCase()]);

    if (para.start) {
        queryOption.skip = para.start;
    }
    if (para.limit) {
        queryOption.limit = para.limit;
    }
    if (para.q) {
        queryOption.query = para.q;
    }
    return queryOption;
}

function getChartSetParameter(req) {
    let para = {};
    ["sort", "order", "limit", "start", "q"].forEach((key) => (req.query[key] ? (para[key] = isNaN(req.query[key]) ? req.query[key] : parseInt(req.query[key])) : null));

    let queryOption = {};

    if (!para.sort || !new Set(["timestamp", "lastUpdateTimestamp"]).has(para.sort)) {
        para.sort = "timestamp";
    }
    if (!para.order || !new Set(["asc", "desc"]).has(para.order.toLowerCase())) {
        para.order = "desc";
    }
    queryOption.sort = [];
    queryOption.sort.push([para.sort, para.order.toLowerCase()]);

    if (para.start) {
        queryOption.skip = para.start;
    }
    if (para.limit) {
        queryOption.limit = para.limit;
    }
    if (para.q) {
        queryOption.query = para.q;
    }
    return queryOption;
}


/**
 * Chart APIs
 */

router.post('/charts', function(req, res, next) {
    chartModule.create(req.body, function(err, result) {
        if (err) {
            res.send(err.message);
        } else {
            res.send(result);
        }
    });
});

router.get('/charts', function(req, res, next) {
    chartModule.all(getChartParameter(req), function(err, docs) {
        res.send(docs);
    });
});

router.delete('/charts/:id', function(req, res, next) {
    let id = req.params.id;

    chartModule.remove(id, function(err, result) {
        res.status(204).send('');
    });
});

router.delete('/charts', function(reg, res, next) {
    chartModule.clearCollection(function(err, result) {
        res.status(204).send('');
    });
});

router.get('/charts/:id', function(req, res, next) {
    let id = req.params.id;

    chartModule.getOne(id, function(err, docs) {
        if (docs[0] === undefined) {
            res.status(404).send('');
        } else {
            res.send(docs[0]);
        }
    });
});


/**
 * Chart Set APIs
 */

router.post('/chart-sets', function(req, res, next) {
    chartSetModule.create(req.body, function(err, result) {
        if (err) {
            res.send(err.message);
        } else {
            res.send(result);
        }
    });
});

router.get('/chart-sets', function(req, res, next) {
    chartSetModule.all(getChartSetParameter(req), function(err, docs) {
        res.send(docs);
    });
});

router.get('/chart-sets/:id', function(req, res, next) {
    let id = req.params.id;

    chartSetModule.getOne(id, function(err, docs) {
        if (docs[0] === undefined) {
            res.status(404).send('');
        } else {
            res.send(docs[0]);
        }
    });
});

router.delete('/chart-sets', function(reg, res, next) {
    chartSetModule.clearCollection(function(err, result) {
        res.status(204).send('');
    });
});

router.delete('/chart-sets/:id', function(req, res, next) {
    let id = req.params.id;

    chartSetModule.remove(id, function(err, result) {
        res.status(204).send('');
    });
});

router.put('/chart-sets/:id', function(req, res, next) {
    let id = req.params.id;
    // console.log("JoryTest" + id);
    // console.log(req.body);
    chartSetModule.updateOne(id, req.body, function(err, result) {
        console.log("Update one chart-set,Result is:" + result);
        res.send(result);
    });
});

//T-P-007 REST API: Get one chart's options Owen
router.get('/charts/:id/options', function(req, res, next) {
    let id = req.params.id;
    chartModule.getChartOptionById(id, function(err, docs) {
        res.send(docs[0].options);
    });
});

//T-P-008 REST API: Update one chart's options Owen
router.post('/charts/:id/options', function(req, res, next) {
    let id = req.params.id;
    //var test = {"title": "AAAA", "hAxis": {"title": "TTT"}, "vAxis": {"title": "SSS"}};
    chartModule.updateChartOptionById(id, req.body, function(err, result) {
        if (!err) {
            res.send("success");
        } else {
            res.send(err);
        }
    });
});

//T-P-009 REST API: Get one chart's datatable   Owen
router.get('/charts/:id/datatable', function(req, res, next) {
    let id = req.params.id;
    chartModule.getChartDataTableById(id, function(err, docs) {
        res.send(docs[0].datatables);
    });
});

//T-P-010 REST API: Update one chart's datatable Owen
router.post('/charts/:id/datatable', function(req, res, next) {
    let id = req.params.id;
    chartModule.updateChartDataTableById(id, req.body, function(err, result) {
        if (!err) {
            res.send("success");
        } else {
            res.send(err);
        }
    });
});


/**
 * Search APIs
 *
 * TODO: Total could limit to 100
 */

// {@link https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#search-both-charts-and-chart-sets}
router.get('/search', function(req, res, next) {
    chartModule.all(getChartParameter(req), function(err, chartDocs) {
        chartSetModule.all(getChartSetParameter(req), function(err, chartSetDocs) {
            var totalCount = chartDocs.length + chartSetDocs.length;
            var items = chartSetDocs.concat(chartDocs);

            res.send({
                total_count: totalCount,
                items: items
            });
        });
    });
});

router.get('/search/charts', function(req, res, next) {
    chartModule.all(getChartParameter(req), function(err, docs) {
        res.send({
            total_count: docs.length,
            items: docs
        });
    });
});

router.get('/search/chart-sets', function(req, res, next) {
    chartSetModule.all(getChartSetParameter(req), function(err, docs) {
        res.send({
            total_count: docs.length,
            items: docs
        });
    });
});

module.exports = router;
