/**
 * Created by MMo2 on 6/20/2016.
 */
var fs = require('fs');

var should = require('should'),
  excelHelper = require('../../helpers/excelHelper'),
  fixtures = require('../fixtures/excelHelper');


describe('Model excelHelper Tests', function() {
  before(function(done) {
    var path = "../." + excelHelper.getWorkPath(excelHelper.MODE_TEST);
    fixtures.setting.filename = path + "/" + fixtures.setting.filename;
    done();
  });

  beforeEach(function(done) {
    var path = "." + excelHelper.getWorkPath(excelHelper.MODE_TEST);
    var files = [];

    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(function(file, index) {
        var curPath = path + "/" + file;
        fs.unlinkSync(curPath);
      });
    }
    done();
  });

  it('write and read', function(done) {
    excelHelper.writeXlsx(fixtures.setting, fixtures.data, function() {
      var rs = {};
      excelHelper.readFile(fixtures.setting, function(result) {
        done();
      }, excelHelper.MODE_TEST);
    }, excelHelper.MODE_TEST);
  });

});
