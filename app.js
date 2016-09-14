var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var express      = require('express');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var multipart    = require('connect-multiparty');
var path         = require('path');

var chartFile    = require('./routes/chart-file');
var db           = require('./helpers/dbHelper');
var routes       = require('./routes/index');
var restAPI      = require('./routes/rest-api');
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
  uploadDir: "./excelPath/prod"
}));


app.use('/', routes);
app.use('/api/v1', restAPI);
// TODO: Remove 'routes/chart-file.js'
// app.use('/chartFile', chartFile);
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

module.exports = app;

db.get();

var port = process.env.PORT || 3000;
console.log('Listening on port 3000');
app.listen(port);
