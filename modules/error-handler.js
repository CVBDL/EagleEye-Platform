'use strict';


/**
 * Handle '400 Bad Request' error.
 * @function
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
let handleBadRequest = function (err, req, res, next) {
  let message = err.customMessage || 'Problems parsing JSON';

  res.status(400).send({
    message: message
  });
};


/**
 * Handle '422 Unprocessable Entity' error.
 * @function
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
let handleUnprocessableEntity = function (err, req, res, next) {
  let message = err.customMessage || 'Validation Failed';

  res.status(422).send({
    message: message,
    errors: err.errors
  });
};


/**
 * Handle '404 Not Found' error.
 * @function
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
let handleNotFound = function (err, req, res, next) {
  let message = err.customMessage || 'Not Found';
  let documentationUrl =
    'https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md';

  res.status(404).send({
    message: message,
    documentationUrl: documentationUrl
  });
};


/**
 * Handle '500 Internal Server Error' error.
 * @function
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
let handleInternalServerError = function (err, req, res, next) {
  let message = err.customMessage || 'Internal Server Error';

  res.status(500).send({
    message: message
  });
};


/**
 * Handle errors.
 * @method
 *
 * @param err
 * @param req
 * @param res
 * @param next
 */
module.exports = function errorHandler(err, req, res, next) {
  if (err.status === 422) {
    handleUnprocessableEntity(err, req, res);

  } else if (err.status === 400) {
    handleBadRequest(err, req, res);

  } else if (err.status === 404) {
    handleNotFound(err, req, res);

  } else {
    // default handler
    handleInternalServerError(err, req, res);
  }
};
