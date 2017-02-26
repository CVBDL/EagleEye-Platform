'use strict';

let MongoClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId;
let should = require('should');

let dbClient = require('../../helpers/dbHelper');
let tasks = require('../../modules/tasks');
let jobsFixtures = require('../fixtures/jobs');
let tasksFixtures = require('../fixtures/tasks');

const JOB_COLLECTION = dbClient.COLLECTION.JOB;
const TASK_COLLECTION = dbClient.COLLECTION.TASK;

const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;


describe('modules: tasks', function () {

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
      let fixture = tasksFixtures.collections.task[0];
      let id = fixture._id;
      let data = {
        state: 'success'
      };

      tasks.update(id, data)
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

    it('should update "lastState" of its job', function (done) {
      let fixture = tasksFixtures.collections.task[0];
      let id = fixture._id;
      let data = {
        state: 'success'
      };

      tasks.update(id, data)
        .then(function (doc) {

          return MongoClient.connect(DB_CONNECTION_URI)
            .then(function (db) {
              let collection = db.collection(JOB_COLLECTION);

              return collection
                .find({ _id: doc.job._id })
                .limit(1)
                .toArray()
                .then(function (docs) {
                  db.close(true);

                  try {
                    docs.length.should.eql(1);
                    docs[0].lastState.should.eql(data.state);

                    done();

                  } catch (err) {
                    done(err);
                  }
                });
            });

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

      tasks.update(id, data)
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

      tasks.update(id, data)
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
      let fixture = tasksFixtures.collections.task[0];
      let id = fixture._id;
      let data = {
        state: 'unknown'
      };

      tasks.update(id, data)
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
      let fixtures = tasksFixtures.collections.task;
      let fixture = fixtures[0];
      let jobId = fixture.job._id;
      let count = fixtures.filter(function (item) {
        return item.job._id.toHexString() === jobId.toHexString();
      }).length;
      
      tasks.listByJobId(jobId)
        .then(function (docs) {
          docs.length.should.eql(count);

          done();
        })
        .catch(done)
    });

    it('should return error 422 when passing invalid id', function (done) {
      let jobId = '0';

      tasks.listByJobId(jobId)
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

      tasks.listByJobId(jobId)
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


  describe('all', function () {

    it('should list all tasks', function (done) {
      let fixtures = tasksFixtures.collections.task;

      tasks.list()
        .then(function (docs) {
          docs.length
            .should
            .eql(fixtures.length);

          done();
        });
    });
  });


  describe('getOne', function () {

    it('should select one task by id', function (done) {
      let fixture = tasksFixtures.collections.task[0];
      let id = fixture._id;

      tasks.get(id)
        .then(function (docs) {
          docs.length.should.eql(1);

          docs[0].job
            .should
            .eql(fixture.job);
          docs[0].state
            .should
            .eql(fixture.state);

          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if cannot find the record', function (done) {
      let id = '000000000000000000000000';

      tasks.get(id)
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

      tasks.get(id)
        .then(function (docs) {
          should.fail(null, null, 'Promise should be resolved.');

        }, function (error) {
          error.should.eql({
            status: 422,
            errors: [{
              "resource": "task",
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

    it('should delete one task with given id', function (done) {
      let id = tasksFixtures.collections.task[0]._id;

      tasks.delete(id)
        .then(function (result) {
          result.deletedCount.should.eql(1);
          done();

        }, function () {
          should.fail(null, null, 'Promise should be resolved.');
        })
        .catch(done);
    });

    it('should return error 404 if no record to delete', function (done) {
      let nonexistentId = '000000000000000000000000';

      tasks.delete(nonexistentId)
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
