'use strict';

let request = require('supertest');
let should = require('should');

let app = require('../app');

describe('app.js', function () {

  it('should response 404 if access an unknown route', function (done) {
    request(app)
      .get('/unknown')
      .send()
      .expect('Content-Type', /json/)
      .expect(function (res) {
        res.body.message.should.eql('Not Found');
      })
      .expect(404, done);
  });
});
