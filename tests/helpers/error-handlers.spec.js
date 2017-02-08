'use strict';

let should = require('should');
let sinon = require('sinon');

require('should-sinon');

let errorHandler = require('../../helpers/error-handlers');

describe('helpers: error-handlers', function () {
  let req;
  let res;
  let next;

  // spies and stubs
  beforeEach(function () {
    req = {};
    res = {};
    res.status = sinon.stub().returns(res);
    res.send = sinon.spy();

    next = function noop() { };
  });

  it('should handle 422 error', function () {
    let err = new Error();
    err.status = 422;
    err.errors = [];
    let message = 'Validation Failed';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(422);
    res.send.should.be.calledWith({
      message: message,
      errors: err.errors
    });
  });

  it('should handle 422 error with custom message', function () {
    let err = new Error();
    err.status = 422;
    err.errors = [];
    err.customMessage = 'custom message';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(422);
    res.send.should.be.calledWith({
      message: err.customMessage,
      errors: err.errors
    });
  });

  it('should handle 400 error', function () {
    let err = new Error();
    err.status = 400;
    let message = 'Problems parsing JSON';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(400);
    res.send.should.be.calledWith({
      message: message
    });
  });

  it('should handle 400 error with custom message', function () {
    let err = new Error();
    err.status = 400;
    err.customMessage = 'custom message';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(400);
    res.send.should.be.calledWith({
      message: err.customMessage
    });
  });

  it('should handle 404 error', function () {
    let err = new Error();
    err.status = 404;
    let message = 'Not Found';
    let documentationUrl =
      'https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(404);
    res.send.should.be.calledWith({
      message: message,
      documentationUrl: documentationUrl
    });
  });

  it('should handle 404 error with custom message', function () {
    let err = new Error();
    err.status = 404;
    err.customMessage = 'custom message';
    let documentationUrl =
      'https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(404);
    res.send.should.be.calledWith({
      message: err.customMessage,
      documentationUrl: documentationUrl
    });
  });

  it('should handle other errors as 500', function () {
    let err = new Error();
    let message = 'Internal Server Error';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(500);
    res.send.should.be.calledWith({
      message: message
    });
  });

  it('should handle 500 error', function () {
    let err = new Error();
    err.status = 500;
    let message = 'Internal Server Error';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(500);
    res.send.should.be.calledWith({
      message: message
    });
  });

  it('should handle other errors as 500 with custom message', function () {
    let err = new Error();
    err.status = 500;
    err.customMessage = 'custom message';

    errorHandler(err, req, res, next);

    res.status.should.be.calledWith(500);
    res.send.should.be.calledWith({
      message: err.customMessage
    });
  });
});
