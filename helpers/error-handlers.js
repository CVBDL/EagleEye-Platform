'use strict';

let handleBadRequest = function (err, req, res, next) {
  let message = err.customMessage || 'Problems parsing JSON';

  res.status(400).send({
    message: message
  });

  if (next) {
    next();
  }
};

let handleUnprocessableEntity = function (err, req, res, next) {
  let message = err.customMessage || 'Validation Failed';

  res.status(422).send({
    message: message,
    errors: err.errors
  });

  if (next) {
    next();
  }
};

let handleNotFound = function (err, req, res, next) {
  let message = err.customMessage || 'Not Found';

  res.status(404).send({
    message: message
  });

  if (next) {
    next();
  }
};

exports.handleInternalError = function (err, req, res, next) {
  let message = err.customMessage || 'Internal Server Error';

  res.status(500).send({
    message: err.message 
  });

  if (next) {
    next();
  }
};

exports.handle = function (err, req, res, next) {

  if (err.status === 422) {
    handleUnprocessableEntity(err, req, res, next);

  } else if (err.status === 400) {
    handleBadRequest(err, req, res, next);

  } else if (err.status === 404) {
    handleNotFound(err, req, res, next);

  } else {
    // default handler
    exports.handleInternalError(err, req, res, next);
  }
};
