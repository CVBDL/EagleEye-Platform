/**
 * Created by MMo2 on 6/22/2016.
 */
'use strict';

var should = require('should'),
  DB = require('../../helpers/dbHelper'),
  excelHelper = require('../../helpers/excelHelper'),
  fixtures = require('../fixtures/chartModule'),
  writeFixtures = require('../fixtures/excelModule.json'),
  datatableFixture = require('../fixtures/datatable.json');

var charts = require('../../modules/charts');
var excel = require('../../modules/excel');

describe('excel spec Tests', function() {
  before(function(done) {
    DB.connect(DB.MODE_TEST, done);
  });

  beforeEach(function(done) {
    DB.drop(function(err) {
      if (err) return done(err)
      DB.fixtures(fixtures, done);
    })
  });

  //it('writeOne: id', function(done) {
  //    var setting = {
  //      "filename": "testChartModule2Excel.xlsx",
  //      "worksheet": "Data",
  //    };

  //    var docMock = {
  //      datatable: datatableFixture
  //    };

  //    excel.writeOne(docMock, setting, function() {
  //      excelHelper.readFile(setting, function(result) {
		//	let expectedResult =[
		//	  ["name(string)", "dept(string)", "lunchTime(timeofday)", "salary(number)", "hireDate(date)", "age(number)", "isSenior(boolean)", "seniorityStartTime(datetime)"],
		//	  ["John", "Eng", "12:00:00", 1000, "2005-03-19", 35, "true", "2007-12-02 15:56:00"],
		//	  ["Dave", "Eng", "13:01:30.123", "500.5", "2006-04-19", 27, "false", "2005-03-09 12:30:00.32"],
		//	  ["Sally", "Eng", "09:30:05", 600, "2005-10-10", 30, "false", "null"]
		//	];
		//	result.should.eql(expectedResult);
		//	done();
  //      }, excelHelper.MODE_TEST);
  //    }, excelHelper.MODE_TEST);

  //});

  // it('updateFromFile', function(done) {
  //   charts.getOne("c-eagleeye-line-chart", function(err, docs) {
  //     docs.length.should.eql(1);

  //     excelHelper.writeXlsx(writeFixtures.setting, writeFixtures.data, function() {
  //       var setting = {
  //         filename: "datatable.xlsx",
  //         "worksheet": "Data"
  //       };

  //       excel.updateFromFileToDB(docs[0], setting, function(err) {
  //         charts.getOne("c-eagleeye-line-chart", function(err, newDocs) {
  //           newDocs[0].datatable.rows.should.eql(datatableFixture.rows);
		// 	fixtures.collections.chart_collection[0].type
		// 	newDocs[0].type.should.eql(fixtures.collections.chart_collection[0].type);
		// 	newDocs[0].chartType.should.eql(fixtures.collections.chart_collection[0].chartType);
  //           done();
  //         });
  //       }, excelHelper.MODE_TEST);

  //     }, excelHelper.MODE_TEST);
  //   })
  // });
});
