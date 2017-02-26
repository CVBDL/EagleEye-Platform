'use strict';

let fs = require('fs');
let path = require('path');
let request = require('supertest');
let should = require('should');

let app = require('../../app');
let dbClient = require('../../helpers/db');
let tasks = require('../../modules/tasks');
let jobsFixtures = require('../fixtures/jobs');
let tasksFixtures = require('../fixtures/tasks');


describe('routes: /tasks/:id', function () {

  before(function () {
    return dbClient.connect();
  });

  beforeEach(function () {
    return dbClient.drop()
      .then(function () {
        return dbClient.fixtures(jobsFixtures);
      })
      .then(function () {
        return dbClient.fixtures(tasksFixtures);
      });
  });


  /**
   * Edit task state.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#edit-task-state>
   */
  describe('PUT /api/v1/tasks/:_id', function () {

    it('should replace task state', function (done) {
      let id = tasksFixtures.collections.task[0]._id.toHexString();
      let data = {
        state: "success"
      };

      request(app)
        .put(`/api/v1/tasks/${id}`)
        .set('Content-Type', 'application/json')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
          res.body.state.should.eql(data.state);
        })
        .expect(200, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let id = '0';
      let data = {
        state: "success"
      };

      request(app)
        .put(`/api/v1/tasks/${id}`)
        .send(data)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "task",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';
      let data = {
        state: "success"
      };

      request(app)
        .put(`/api/v1/tasks/${id}`)
        .send(data)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });
});
