'use strict';

var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var express      = require('express');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var multipart    = require('connect-multiparty');
var path         = require('path');

var apis         = require('./routes/apis');
var rootApi      = require('./routes/root-endpoint');
var chartSetsApi = require('./routes/chart-sets');
var etlApi       = require('./routes/etl');
var config       = require('./modules/config');
var db           = require('./helpers/dbHelper');
var routes       = require('./routes/index');
var scheduleTask = require('./routes/schedule-management');

var app = express();

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
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multipart({
  uploadDir: path.join(__dirname, './excelPath/prod')
}));

// register routes
app.use('/', routes);
app.use('/api/v1', rootApi);
app.use('/api/v1', etlApi);
app.use('/api/v1', chartSetsApi);
app.use('/api/v1', apis);
app.use('/schedule', scheduleTask);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

db.get();

config.load().then(function(config) {
  var port = config.port || 3000;

  app.listen(port);
  console.log('Listening on port ' + port);
});

module.exports = app;
