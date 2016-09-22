/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let express = require('express');
let router = express.Router();
let fs = require('fs');
var path = require('path');

let chartModule = require('../modules/chartModule');
let chartSetModule = require('../modules/chartSetModule');
let excelHelper = require('../helpers/excelHelper');
let excelModule = require('../modules/excelModule');

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

router.put('/charts/:id', function(req, res, next) {
  let id = req.params.id;

  chartModule.updateOne(id, req.body, function(err, result) {
    return err ? res.send(err) : res.send(result);
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

  chartSetModule.updateOne(id, req.body, function(err, result) {
    console.log("Update one chart-set,Result is:" + result);
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
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


/**
 * Upload & Download assets APIs
 */

router.post('/upload/excels', function(req, multipartyMiddleware) {
  let file = req.files.file;
  let fileName = "";
  if (file.path.indexOf("/") > -1) {
    let pathArray = file.path.split("/");
    fileName = pathArray[pathArray.length - 1];
  } else {
    let pathArray = file.path.split("\\");
    fileName = pathArray[pathArray.length - 1];
  }
  // console.log(req.body.id);
  chartModule.getOne(req.body.id, function(err, docs) {
    if (docs.length < 1) {
      multipartyMiddleware.send('failed');
      return;
    }
    excelModule.updateFromFileToDB(docs[0], { filename: fileName, worksheet: "Data" }, function(result) {
      //console.log(result);
      multipartyMiddleware.send('ok');
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
  });
});

router.post('/upload/images', function(req, multipartyMiddleware) {
  let file = req.files.file;
  let fileName = "";
  if (file.path.indexOf("/") > -1) {
    let pathArray = file.path.split("/");
    fileName = pathArray[pathArray.length - 1];
  } else {
    let pathArray = file.path.split("\\");
    fileName = pathArray[pathArray.length - 1];
  }

  let targetFileName = 'IC_' + Math.ceil(Math.random() * 1000000) + fileName;
  let targetPath = path.join(__dirname, '../public/uploadChartImages/' + targetFileName)

  chartModule.updateImageChartFile(req.body.id, targetFileName, function(err, result) {
    if (err) {
      multipartyMiddleware.send('failed');
      return;
    } else
      multipartyMiddleware.send('ok');

    let stream = fs.createReadStream(file.path).pipe(fs.createWriteStream(targetPath));
    stream.on('finish', () => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
  });
});

router.get('/download/excels/:id', function(req, res, next) {
  let id = req.params.id;

  chartModule.getOne(req.params.id, function(err, docs) {
    if (docs.length > 0) {
      res.setHeader('Content-disposition', 'attachment; filename=' + (docs[0]._id) + '.xlsx');
      res.setHeader('Content-type', 'application/vnd.ms-excel');
      excelModule.writeOne(docs[0], {
        "outStream": res,
        "worksheet": "Data",
      }, () => console.log());
    }
  });
});

module.exports = router;
