'use strict';

let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let express = require('express');
let favicon = require('serve-favicon');
let logger = require('morgan');
let multipart = require('connect-multiparty');
let path = require('path');

let db = require('./helpers/dbHelper');
let utils = require('./helpers/utils');
let errHandlers = require('./helpers/error-handlers');
let rootApi = require('./routes/root-endpoint');
let chartsApi = require('./routes/charts');
let chartSetsApi = require('./routes/chart-sets');
let jobsApi = require('./routes/jobs');
let tasksApi = require('./routes/tasks');
let searchApi = require('./routes/search');
let uploadApi = require('./routes/upload');
let downloadApi = require('./routes/download');
let etlApi = require('./routes/etl');
let routes = require('./routes/index');
let scheduleTask = require('./routes/schedule-management');

let app = express();

// CORS support
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if (app.get('env') === 'development') {
  app.use(logger('dev'));
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multipart({
  uploadDir: path.join(__dirname, './excelPath/prod')
}));

// register routes
app.use('/', routes);
app.use('/api/v1', rootApi);
app.use('/api/v1', etlApi);
app.use('/api/v1', chartsApi);
app.use('/api/v1', chartSetsApi);
app.use('/api/v1', jobsApi);
app.use('/api/v1', uploadApi);
app.use('/api/v1', downloadApi);
app.use('/schedule', scheduleTask);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    console.log(err);
  });
}

app.use(function (err, req, res, next) {
  errHandlers.handle(err, req, res, next);
});

db.get();

module.exports = app;
