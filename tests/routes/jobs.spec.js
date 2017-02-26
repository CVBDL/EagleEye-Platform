'use strict';

let fs = require('fs');
let path = require('path');
let request = require('supertest');
let should = require('should');

let app = require('../../app');
let dbClient = require('../../helpers/db');
let jobsFixtures = require('../fixtures/jobs');
let tasksFixtures = require('../fixtures/tasks');


describe('routes: /jobs', function () {

  before(function () {
    return dbClient.connect();
  });

  beforeEach(function () {
    return dbClient.drop()
      .then(function () {
        return dbClient.fixtures(jobsFixtures);
      });
  });


  /**
   * List jobs.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#list-jobs>
   */
  describe('GET /api/v1/jobs', function () {

    it('should fetch all jobs', function (done) {
      let fixtures = jobsFixtures.collections.job;

      request(app)
        .get('/api/v1/jobs')
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length
            .should
            .eql(fixtures.length);
        })
        .expect(200, done);
    });
  });


  /**
   * Create a job.
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#create-a-job>
   */
  describe('POST /api/v1/jobs', function () {

    it('should create a job', function (done) {
      let job = {
        name: "Extract data",
        expression: "0 0 * * *",
        command: "/path/to/command/codecollaborator2eagleeye.exe"
      };

      request(app)
        .post('/api/v1/jobs')
        .send(job)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.name.should.eql(job.name);
          res.body.expression.should.eql(job.expression);
          res.body.command.should.eql(job.command);
          res.body.enabled.should.eql(true);
          res.body.createdAt.should.eql(res.body.updatedAt);

          // should update `updatedAt` field
          // use 1 second threshold
          (Date.now() - new Date(res.body.updatedAt).getTime())
            .should
            .belowOrEqual(1000);
        })
        .expect(200, done);
    });

    it('should response 422 if received unprocessable entity', function (done) {
      let job = {};

      request(app)
        .post('/api/v1/jobs')
        .send(job)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([{
            resource: "job",
            field: 'name',
            code: "missing_field"
          }, {
            resource: "job",
            field: 'expression',
            code: "missing_field"
          }, {
            resource: "job",
            field: 'command',
            code: "missing_field"
          }]);
        })
        .expect(422, done);
    });
  });
});


describe('routes: /jobs/:id', function () {

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
   * Get a single job
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#get-a-single-job>
   */
  describe('GET /api/v1/jobs/:id', function () {

    it('should fetch a single job with the given id', function (done) {
      let id = jobsFixtures.collections.job[0]._id.toHexString();

      request(app)
        .get(`/api/v1/jobs/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body._id.should.eql(id);
        })
        .expect(200, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let id = '0';

      request(app)
        .get(`/api/v1/jobs/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "job",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';

      request(app)
        .get(`/api/v1/jobs/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });


  /**
   * Delete a single job
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#delete-a-job>
   */
  describe('DELETE /api/v1/jobs/:id', function () {

    it('should delete a job by id', function (done) {
      let id = jobsFixtures.collections.job[0]._id.toHexString();

      request(app)
        .delete(`/api/v1/jobs/${id}`)
        .send()
        .expect(204, done);
    });

    it('should response 422 if sent invalid id', function (done) {
      let id = '0';

      request(app)
        .delete(`/api/v1/jobs/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Validation Failed');
          res.body.errors.should.eql([
            {
              "resource": "job",
              "field": "_id",
              "code": "invalid"
            }
          ]);
        })
        .expect(422, done);
    });

    it('should response 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';

      request(app)
        .delete(`/api/v1/jobs/${id}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.message.should.eql('Not Found');
        })
        .expect(404, done);
    });
  });
});


describe('routes: /jobs/:id/restart', function () {

  /**
   * Restart a job
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#restart-a-job>
   */
  describe('PUT /api/v1/jobs/:id/restart', function () {

    it('should restart a job', function (done) {
      let id = jobsFixtures.collections.job[0]._id.toHexString();

      request(app)
        .put(`/api/v1/jobs/${id}/restart`)
        .send()
        .expect(204, done);
    });
  });
});


describe('routes: /jobs/:id/tasks', function () {

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
   * List tasks
   * <https://github.com/CVBDL/EagleEye-Docs/blob/master/rest-api/rest-api.md#list-tasks>
   */
  describe('GET /api/v1/jobs/:id/tasks', function () {

    it('should list tasks to this job', function (done) {
      let id = jobsFixtures.collections.job[0]._id.toHexString();

      request(app)
        .get(`/api/v1/jobs/${id}/tasks`)
        .send()
        .expect('Content-Type', /json/)
        .expect(function (res) {
          res.body.length.should.eql(2);
        })
        .expect(200, done);
    });
  });
});
