/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let express = require('express');
let fs      = require('fs');
let os      = require('os');
let path    = require('path');

let charts      = require('../modules/charts');
let chartSets   = require('../modules/chart-sets');
let excelHelper = require('../helpers/excelHelper');
let excel       = require('../modules/excel');
let etl         = require('../modules/etl');
let importData  = require('../modules/importData');
let utils       = require('../helpers/utils');
let jobLog      = require('../modules/scheduleJobLogModule');
var scheduleJobHelper = require('../helpers/scheduleJobHelper');

let router  = express.Router();

function getChartParameter(req) {
  let para = {};
  ["sort", "order", "limit", "start", "q"].forEach((key) => (req.query[key] ? (para[key] = isNaN(req.query[key]) ? req.query[key] : parseInt(req.query[key])) : null));
  let queryOption = {};

  if (!para.sort || !new Set(["createdAt", "updatedAt", "chartType"]).has(para.sort)) {
    para.sort = "createdAt";
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

  if (!para.sort || !new Set(["createdAt", "updatedAt"]).has(para.sort)) {
    para.sort = "createdAt";
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

function handleError(err, res) {
  res.status(400).send({
    "message": err.message,
    "errors": [err]
  });
}


/**
 * List all the endpoint categories
 */
router.get('/', function(req, res, next) {
  utils.getRestApiRootEndpoint().then(function(rootEndpoint) {
    res.send({
      "charts_url":            rootEndpoint + '/charts/{chart_id}',
      "chart_sets_url":        rootEndpoint + '/chart-sets/{chart_set_id}',
      "search_url":            rootEndpoint + '/search',
      "search_charts_url":     rootEndpoint + '/search/charts',
      "search_chart_sets_url": rootEndpoint + '/search/chart-sets',
      "upload_excels_url":     rootEndpoint + '/upload/excels',
      "upload_images_url":     rootEndpoint + '/upload/images',
      "download_excels_url":   rootEndpoint + '/download/excels/:id'
    });
  });
});


/**
 * ETL
 */
router.get('/etl', function(req, res, next) {
  etl.start();
  res.status(204).send('');
});


/**
 * Chart APIs
 */

router.post('/charts', function(req, res, next) {
  charts.create(req.body, function(err, result) {
    if (err) {
      res.send(err.message);
    } else {
      res.send(result);
    }
  });
});

router.get('/charts', function(req, res, next) {
  charts.all(getChartParameter(req), function(err, docs) {
    res.send(docs);
  });
});

router.delete('/charts/:id', function(req, res, next) {
  let id = req.params.id;

  charts.remove(id, function(err, result) {
    res.status(204).send('');
  });
});

router.delete('/charts', function(reg, res, next) {
  charts.clearCollection(function(err, result) {
    res.status(204).send('');
  });
});

router.get('/charts/:id', function(req, res, next) {
  let id = req.params.id;

  charts.getOne(id, function(err, docs) {
    if (docs[0] === undefined) {
      res.status(404).send('');
    } else {
      res.send(docs[0]);
    }
  });
});

router.put('/charts/:id', function(req, res, next) {
  let id = req.params.id;

  charts.updateOne(id, req.body, function(err, doc) {
    return err ? handleError(err, res) : res.send(doc.value);
  });
});

router.put('/charts/:id/datatable', function(req, res, next) {
  let id = req.params.id;
  // console.log(id);
  // console.log(req.body);
  importData.updateChartWithRawData(id, req.body.datatable, function(err, result) {
    return err ? handleError(err, res) : res.send(result.value);
  });
  // res.send('ok');
});

/**
 * Chart Set APIs
 */

router.post('/chart-sets', function(req, res, next) {
  chartSets.create(req.body, function(err, result) {
    if (err) {
      res.send(err.message);
    } else {
      res.send(result);
    }
  });
});

router.get('/chart-sets', function(req, res, next) {
  chartSets.all(getChartSetParameter(req), function(err, docs) {
    res.send(docs);
  });
});

router.get('/chart-sets/:id', function(req, res, next) {
  let id = req.params.id;

  chartSets.getOne(id).then(function(doc) {
    if (doc) {
      res.send(doc);

    } else {
      res.status(404).send('');
    }
  });
});

router.delete('/chart-sets', function(reg, res, next) {
  chartSets.clearCollection(function(err, result) {
    res.status(204).send('');
  });
});

router.delete('/chart-sets/:id', function(req, res, next) {
  let id = req.params.id;

  chartSets.remove(id, function(err, result) {
    res.status(204).send('');
  });
});

router.put('/chart-sets/:id', function(req, res, next) {
  let id = req.params.id;

  chartSets.updateOne(id, req.body, function(err, doc) {
    return err ? handleError(err, res) : res.send(doc.value);
  });
});


/**
 * Search APIs
 *
 * TODO: Total could limit to 100
 */

// {@link https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#search-both-charts-and-chart-sets}
router.get('/search', function(req, res, next) {
  charts.all(getChartParameter(req), function(err, chartDocs) {
    chartSets.all(getChartSetParameter(req), function(err, chartSetDocs) {
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
  charts.all(getChartParameter(req), function(err, docs) {
    res.send({
      total_count: docs.length,
      items: docs
    });
  });
});

router.get('/search/chart-sets', function(req, res, next) {
  chartSets.all(getChartSetParameter(req), function(err, docs) {
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
  charts.getOne(req.body.id, function(err, docs) {
    if (docs.length < 1) {
      multipartyMiddleware.send('failed');
      return;
    }
    excel.updateFromFileToDB(docs[0], { filename: fileName, worksheet: "Data" }, function(result) {
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

  charts.updateImageChartFile(req.body.id, targetFileName, function(err, result) {
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

  charts.getOne(req.params.id, function(err, docs) {
    if (docs.length > 0) {
      res.setHeader('Content-disposition', 'attachment; filename=' + (docs[0]._id) + '.xlsx');
      res.setHeader('Content-type', 'application/vnd.ms-excel');
      excel.writeOne(docs[0], {
        "outStream": res,
        "worksheet": "Data",
      }, () => console.log());
    }
  });
});

router.get('/jobs', function(req, res, next) {
  res.send(scheduleJobHelper.getJobList().map(function(x){
    return {
      "_id": x.id,
      "name": x.name,
      "expression": x.time,
      "command": x.para,
      "enabled": x.enable,
    }
  }));
});

router.post('/jobs', function(req, res, next) {
  let job = req.body.name;
  let time = req.body.expression;
  let para = req.body.command;
  scheduleJobHelper.createJob(job, time, para, (err, doc) => {
    if (err) {
      res.status(500).send('');
    } else {
      res.send({
        '_id': doc._id,
        'name': doc.jobName,
        'expression': doc.scheduleTimeString,
        'command': doc.para,
        'enable': doc.enable
      });
    }
  });
});

router.get('/jobs/:id', function(req, res, next) {
  let id = req.params.id;

  jobLog.getOne(id, function(err, docs) {
    if (docs[0] === undefined) {
      res.status(404).send('');
    } else {
      res.send({
        '_id': docs[0]._id,
        'name': docs[0].jobName,
        'expression': docs[0].scheduleTimeString,
        'command': docs[0].para,
        'enable': docs[0].enable
      });
    }
  });
});

router.put('/jobs/:id/restart', function(req, res, next) {
  let id = req.params.id;
  console.log(id);
  scheduleJobHelper.triggerJob(id);
  res.send('ok');
});

router.get('/jobs/:id/tasks', function(req, res, next) {
  let id = req.params.id;

  jobLog.getLogsByJob(id, function(err, docs) {
    res.send({
      total_count: docs.length,
      items: docs
    });
  });
});

router.put('/tasks/:id', function(req, res, next) {
  let id = req.params.id;
  let state = req.body.state;
  console.log(id +" " + state);

  jobLog.updateOne(id, {'state': state}, function(err, doc) {
    return err ? handleError(err, res) : res.send(doc);
  });
});

module.exports = router;
