/**
 * Created by MMo2 on 6/22/2016.
 */
'use strict';

var should = require('should'),
  DB = require('../../helpers/dbHelper'),
  excelHelper = require('../../helpers/excelHelper'),
  fixtures = require('../fixtures/chartModule'),
  writeFixtures = require('../fixtures/excelModule.json');

var charts = require('../../modules/charts');
var excel = require('../../modules/excel');

describe('Model excel Tests', function() {
  before(function(done) {
    DB.connect(DB.MODE_TEST, done);
  });

  beforeEach(function(done) {
    DB.drop(function(err) {
      if (err) return done(err);
      DB.fixtures(fixtures, done);
    })
  });

  
  it('writeOne: id', function(done) {
    charts.getOne("c-eagleeye-line-chart", function(err, docs) {
      docs.length.should.eql(1);
      var setting = {
        //"outStream": outputStream,
        "filename": "testChartModule2Excel.xlsx",
        "worksheet": "Data",
      };
      excel.writeOne(docs[0], setting, function() {
        excelHelper.readFile(setting, function(result) {
          result[0][0].should.eql(docs[0].datatable.cols[0].label);
          result[0][1].should.eql(docs[0].datatable.cols[1].label);
          result[0][2].should.eql(docs[0].datatable.cols[2].label);
          for (let i = 1; i < result.length; i++) {
            for (let j = 0; j < result[i].length; j++) {
              result[i][j].should.eql(docs[0].datatable.rows[i - 1].c[j].v);
            }
          }
          done();
        }, excelHelper.MODE_TEST);
      }, excelHelper.MODE_TEST);
    })
  });

  it('updateFromFile', function(done) {
    charts.getOne("c-eagleeye-line-chart", function(err, docs) {
      docs.length.should.eql(1);
      excelHelper.writeXlsx(writeFixtures.setting, writeFixtures.data, function() {
        var setting = {
          filename: "datatable.xlsx"
        };
        excel.updateFromFileToDB(docs[0], setting, function(err) {
          charts.getOne("c-eagleeye-line-chart", function(err, docs) {
            docs[0].datatable.cols[0].label.should.eql(fixtures.collections.chart_collection[0].datatable.cols[0].label);
            docs[0].datatable.cols[1].label.should.eql(writeFixtures.setting.columns[1].header);
            docs[0].datatable.cols[2].label.should.eql(writeFixtures.setting.columns[2].header);
            done();
          });
        }, excelHelper.MODE_TEST);
      }, excelHelper.MODE_TEST);
    })
  });

});
