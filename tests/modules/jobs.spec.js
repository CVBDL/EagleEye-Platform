'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let dbClient = require('../../helpers/dbHelper');
let jobs = require('../../modules/jobs');
let jobsFixtures = require('../fixtures/jobs');

const JOB_COLLECTION = dbClient.COLLECTION.JOB;

const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;


describe('modules: jobs', function () {

  before(function () {
    return dbClient.connect();
  });

  beforeEach(function () {
    return dbClient.drop()
      .then(function () {
        return dbClient.fixtures(jobsFixtures);
      });
  });


  describe('create', function () {

    it('should be able to create a job', function (done) {
      let job = {
        name: "Extract data",
        expression: "0 0 * * *",
        command: "/path/to/command/codecollaborator2eagleeye.exe",
        enabled: true
      };

      jobs.create(job)
        .then(function (createdJob) {
          createdJob.name.should.eql(job.name);
          createdJob.expression.should.eql(job.expression);
          createdJob.command.should.eql(job.command);
          createdJob.enabled.should.eql(job.enabled);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should set default "enabled" field to "true"', function (done) {
      let job = {
        name: "Extract data",
        expression: "0 0 * * *",
        command: "/path/to/command/codecollaborator2eagleeye.exe"
      };

      jobs.create(job)
        .then(function (createdJob) {
          createdJob.enabled.should.eql(true);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should create and set "createdAt" "updatedAt" fields', function (done) {
      let job = {
        name: "Extract data",
        expression: "0 0 * * *",
        command: "/path/to/command/codecollaborator2eagleeye.exe"
      };

      jobs.create(job)
        .then(function (createdJob) {
          createdJob.createdAt.should.eql(createdJob.updatedAt);

          // should update `updatedAt` field
          // use 1 second threshold
          (Date.now() - new Date(createdJob.updatedAt).getTime())
            .should
            .belowOrEqual(1000);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should verify the required fields', function (done) {
      let job = {
        enabled: true
      };

      jobs.create(job)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
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
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should schedule a new job', function (done) {
      let job = {
        name: "Extract data",
        expression: "0 0 * * *",
        command: "/path/to/command/codecollaborator2eagleeye.exe",
        enabled: true
      };

      jobs.create(job)
        .should
        .not
        .rejectedWith({
          status: 400,
          customMessage: 'Scheduling Job Failed'
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });


  describe('all', function () {

    it('should list all jobs', function (done) {
      jobs.all()
        .then(function (docs) {
          docs.length
            .should
            .eql(jobsFixtures.collections.job.length);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });
  });


  describe('getOne', function () {

    it('should select job by id', function (done) {
      let fixture = jobsFixtures.collections.job[0];
      let id = fixture._id;

      jobs.getOne(id)
        .then(function (docs) {
          docs.length.should.eql(1);

          docs[0]._id
            .should
            .eql(fixture._id);
          docs[0].name
            .should
            .eql(fixture.name);
          docs[0].expression
            .should
            .eql(fixture.expression);
          docs[0].command
            .should
            .eql(fixture.command);
          docs[0].enabled
            .should
            .eql(fixture.enabled);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';

      jobs.getOne(id)
        .should
        .rejectedWith({
          status: 404
        })
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should return error 422 when passing invalid id', function (done) {
      let id = '0';

      jobs.getOne(id)
        .then(function (docs) {
          should.fail(null, null, 'Promise should be resolved.');

        }, function (error) {
          error.should.eql({
            status: 422,
            errors: [{
              "resource": "job",
              "field": "_id",
              "code": "invalid"
            }]
          });

          done();
        })
        .catch(done);
    });
  });


  describe('deleteOne', function () {

    it('should delete one chart with given id', function (done) {
      let id = jobsFixtures.collections.job[0]._id;

      jobs.deleteOne(id)
        .then(function (result) {
          result.deletedCount.should.eql(1);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if no record to delete', function (done) {
      let id = '000000000000000000000000';

      jobs.deleteOne(id)
        .should
        .rejectedWith({
          status: 404
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });

});