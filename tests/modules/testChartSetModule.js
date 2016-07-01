/**
 * Created by MMo2 on 6/15/2016.
 */

var should = require('should')
    , DB = require('../../helpers/dbHelper')
    , fixtures = require('../fixtures/chartSetModule');

var chartSetModule = require('../../modules/chartSetModule');

describe('Model chart set tests', function() {

    var chart = {
      "title": "Chart set sample",
      "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
      "friendlyUrl": "s-eagleeye-chart-set-three",
      "charts": []
    };

    before(function(done) {
        DB.connect(DB.MODE_TEST, done);
    })

    beforeEach(function(done) {
        DB.drop(function(err) {
            if (err) return done(err)
            DB.fixtures(fixtures, done);
        })
    })

    it('all', function(done) {
        chartSetModule.all(function(err, docs) {
            docs.length.should.eql(2);
            done();
        })
    })

    it('clear', function(done) {
        chartSetModule.clearCollection(function(err) {
            chartSetModule.all(function(err, result) {
                result.length.should.eql(0);
                done();
            })
        })
    })

    it('create', function(done) {
        chartSetModule.create(chart, function(err, id) {
            chartSetModule.all(function(err, docs) {
                docs.length.should.eql(3);
                for (var key in fixtures.collections.chart_set_collection[0]) {
                    docs[2][key].should.eql(chart[key]);
                }
                done();
            })
        })
    })

    it('getOne: id', function(done) {
        chartSetModule.create(chart, function(err, id) {
            chartSetModule.getOne(id, function(err, docs) {
                docs.length.should.eql(1);
                for (var key in fixtures.collections.chart_set_collection[0]) {
                    docs[0][key].should.eql(chart[key]);
                }
                done();
            })
        })
    })

    it('getOne: friendlyUrl', function(done) {
        chartSetModule.getOne(fixtures.collections.chart_set_collection[0].friendlyUrl, function(err, docs) {
            docs.length.should.eql(1);
            for (var key in fixtures.collections.chart_set_collection[0]) {
                docs[0][key].should.eql(fixtures.collections.chart_set_collection[0][key]);
            }
            done();
        })
    })

    it('remove', function(done) {
        chartSetModule.all(function(err, docs) {
            chartSetModule.remove(docs[0]._id, function(err) {
                chartSetModule.all(function(err, result) {
                    result.length.should.eql(1);
                    result[0]._id.should.not.eql(docs[0]._id);
                    done();
                })
            })
        })
    })
});
