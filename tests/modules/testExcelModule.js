/**
 * Created by MMo2 on 6/22/2016.
 */

var should = require('should')
    , DB = require('../../helpers/dbHelper')
    , excelHelper = require('../../helpers/excelHelper')
    , fixtures = require('../fixtures/chartModule');

var chartModule = require('../../modules/chartModule');
var excelModule = require('../../modules/excelModule');

describe('Model excel Tests', function() {
    before(function(done) {
        DB.connect(DB.MODE_TEST, done);
    })

    beforeEach(function(done) {
        DB.drop(function(err) {
            if (err) return done(err)
            DB.fixtures(fixtures, done);
        })
    })

    it('writeOne: id', function(done) {
        chartModule.getOne("c-eagleeye-line-chart", function(err, docs) {
            docs.length.should.eql(1);
            excelModule.writeOne(docs[0], done, excelHelper.MODE_TEST);
        })
    })

    it('updateFromFile', function(done) {
        chartModule.getOne("c-eagleeye-line-chart", function(err, docs) {
            docs.length.should.eql(1);
            excelModule.updateFromFile(docs[0], "testChartModule2ExcelRead.xlsx", function(err) {
                chartModule.getOne("c-eagleeye-line-chart", function(err, docs) {
                    docs.length.should.eql(1);
                    done();
                });
            }, excelHelper.MODE_TEST);
        })
    })

});