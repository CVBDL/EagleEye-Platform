'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let dbClient = require('../../helpers/dbHelper');
let tasks = require('../../modules/tasks');
let tasksFixtures = require('../fixtures/tasks');

const TASK_COLLECTION_NAME = "task_collection";
const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;


describe('modules: tasks', function () {

  before(function (done) {
    dbClient.connect(dbClient.MODE_TEST, done);
  });

  beforeEach(function (done) {
    dbClient.drop(function (err) {
      if (err) {
        return done(err);
      }

      dbClient.fixtures(tasksFixtures, done);
    });
  });


  describe('create', function () {

    it('should be able to create a task', function (done) {
      let job = {
        "_id": "57fca45d69ea5f081a6b4076",
        "name": "Code Review By Month",
        "expression": "0 0 * * *",
        "command": "/path/to/command/codecollaborator2eagleeye.exe",
        "enabled": true
      };

      tasks.create(job)
        .then(function (doc) {
          doc.job.should.eql(job);
          doc.state.should.eql('running');
          should.equal(doc.finishedAt, null);

          // should update `startedAt` field
          // use 1 second threshold
          (Date.now() - new Date(doc.startedAt).getTime())
            .should
            .belowOrEqual(1000);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should pass a required job', function (done) {
      let job = null;

      tasks.create(job)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            resource: "task",
            field: "job",
            code: "missing_field"
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });


  describe('updateOne', function () {

    it('should update a task', function (done) {
      let fixture = tasksFixtures.collections.task_collection[0];
      let id = fixture._id;
      let data = {
        state: 'success'
      };

      tasks.updateOne(id, data)
        .then(function (doc) {
          doc._id.should.eql(id);
          doc.job.should.eql(fixture.job);
          doc.startedAt.should.eql(fixture.startedAt);
          doc.state.should.eql(data.state);

          // should update `startedAt` field
          // use 1 second threshold
          (Date.now() - new Date(doc.finishedAt).getTime())
            .should
            .belowOrEqual(1000);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if no record to update', function (done) {
      let id = '000000000000000000000000';
      let data = {
        state: 'success'
      };

      tasks.updateOne(id, data)
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
      let data = {
        state: 'success'
      };

      tasks.updateOne(id, data)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "task",
            "field": "_id",
            "code": "invalid"
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should return error 422 when passing invalid state', function (done) {
      let fixture = tasksFixtures.collections.task_collection[0];
      let id = fixture._id;
      let data = {
        state: 'unknown'
      };

      tasks.updateOne(id, data)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "task",
            "field": "state",
            "code": "invalid"
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });
  });


  describe('getAllByJobId', function () {

    it('should get all tasks by job id', function (done) {
      let fixtures = tasksFixtures.collections.task_collection;
      let fixture = fixtures[0];
      let jobId = fixture.job._id;
      let count = fixtures.filter(function (item) {
        return item.job._id.toHexString() === jobId.toHexString();
      }).length;
      
      tasks.getAllByJobId(jobId)
        .then(function (docs) {
          docs.length.should.eql(count);

          done();
        })
        .catch(done)
    });

    it('should return error 422 when passing invalid id', function (done) {
      let jobId = '0';

      tasks.getAllByJobId(jobId)
        .should
        .rejectedWith({
          status: 422,
          errors: [{
            "resource": "task",
            "field": "_id",
            "code": "invalid"
          }]
        })
        .then(function () {
          done();
        })
        .catch(done);
    });

    it('should return error 404 if no record to update', function (done) {
      let jobId = '000000000000000000000000';

      tasks.getAllByJobId(jobId)
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