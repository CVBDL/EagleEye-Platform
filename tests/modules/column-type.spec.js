'use strict';

let should = require('should');

let columnType = require('../../modules/column-type');

describe('helpers: column types', function () {

  it('should infer to `null` type', function (done) {
    should.equal('null', columnType.infer(null));
    should.equal('null', columnType.infer('null'));

    done();
  });

  it('should infer to `boolean` type', function(done) {
    columnType.infer('true').should.eql('boolean');
    columnType.infer(true).should.eql('boolean');
    columnType.infer('false').should.eql('boolean');
    columnType.infer(false).should.eql('boolean');

    done();
  });

  it('should infer to `number` type', function(done) {
    columnType.infer('3').should.eql('number');
    columnType.infer(3).should.eql('number');
    columnType.infer('3.0').should.eql('number');
    columnType.infer(3.0).should.eql('number');
    columnType.infer('3.14').should.eql('number');
    columnType.infer(3.14).should.eql('number');
    columnType.infer('-71').should.eql('number');
    columnType.infer(-71).should.eql('number');
    columnType.infer('-7.2').should.eql('number');
    columnType.infer(-7.2).should.eql('number');
    columnType.infer('.6').should.eql('number');
    columnType.infer(.6).should.eql('number');

    done();
  });

  it('should infer to `timeofday` type', function(done) {
    columnType.infer('00:00:00').should.eql('timeofday');
    columnType.infer('08:01:59').should.eql('timeofday');
    columnType.infer('12:00:00').should.eql('timeofday');
    columnType.infer('23:59:59').should.eql('timeofday');
    columnType.infer('12:00:00.').should.eql('timeofday');
    columnType.infer('12:00:00.1').should.eql('timeofday');
    columnType.infer('12:00:00.12').should.eql('timeofday');
    columnType.infer('12:00:00.123').should.eql('timeofday');

    done();
  });

  it('should infer to `date` type', function(done) {
    columnType.infer('2016-11-11').should.eql('date');
    columnType.infer('1999-01-01').should.eql('date');

    done();
  });

  it('should infer to `datetime` type', function(done) {
    columnType.infer('2016-11-11 12:00:00').should.eql('datetime');
    columnType.infer('1999-01-01 12:00:00.123').should.eql('datetime');

    done();
  });

  it('should infer to `string` type', function(done) {
    columnType.infer('Name').should.eql('string');
    columnType.infer('Hello world!').should.eql('string');
    columnType.infer('3a').should.eql('string');
    columnType.infer('12-00-00').should.eql('string');
    columnType.infer('11/11/2016').should.eql('string');
    columnType.infer('2016-11-11T12:00:00').should.eql('string');

    done();
  });

  it('Convert to data table format for `boolean` type', function() {
    columnType.convertFileToDataTable('true').should.eql(true);
    columnType.convertFileToDataTable(true).should.eql(true);
    columnType.convertFileToDataTable('false').should.eql(false);
    columnType.convertFileToDataTable(false).should.eql(false);
  });

  it('Convert to data table format for `number` type', function() {
    columnType.convertFileToDataTable('3').should.eql(3);
    columnType.convertFileToDataTable(3).should.eql(3);
    columnType.convertFileToDataTable('3.0').should.eql(3);
    columnType.convertFileToDataTable(3.0).should.eql(3.0);
    columnType.convertFileToDataTable('3.14').should.eql(3.14);
    columnType.convertFileToDataTable(3.14).should.eql(3.14);
    columnType.convertFileToDataTable('-71').should.eql(-71);
    columnType.convertFileToDataTable(-71).should.eql(-71);
    columnType.convertFileToDataTable('-7.2').should.eql(-7.2);
    columnType.convertFileToDataTable(-7.2).should.eql(-7.2);
    columnType.convertFileToDataTable('.6').should.eql(0.6);
    columnType.convertFileToDataTable(.6).should.eql(.6);
  });

  it('Convert to data table format for `timeofday` type', function() {
    columnType.convertFileToDataTable('00:00:00').should.eql([0,0,0]);
    columnType.convertFileToDataTable('08:01:59').should.eql([8,1,59]);
    columnType.convertFileToDataTable('12:00:00').should.eql([12,0,0]);
    columnType.convertFileToDataTable('23:59:59').should.eql([23,59,59]);
    columnType.convertFileToDataTable('12:00:00.').should.eql([12,0,0]);
    columnType.convertFileToDataTable('12:00:00.1').should.eql([12,0,0,1]);
    columnType.convertFileToDataTable('12:00:00.12').should.eql([12,0,0,12]);
    columnType.convertFileToDataTable('12:00:00.123').should.eql([12,0,0,123]);
  });

  it('Convert to data table format for `date` type', function() {
    columnType.convertFileToDataTable('2016-11-11').should.eql('Date(2016,10,11)');
    columnType.convertFileToDataTable('1999-01-01').should.eql('Date(1999,0,1)');
  });

  it('Convert to data table format for `datetime` type', function() {
    columnType.convertFileToDataTable('2016-11-11 12:00:00').should.eql('Date(2016,10,11,12,0,0)');
    columnType.convertFileToDataTable('1999-01-01 12:00:00.123').should.eql('Date(1999,0,1,12,0,0,123)');
  });

  it('Convert to data table format for `string` type', function() {
    columnType.convertFileToDataTable('Name').should.eql('Name');
    columnType.convertFileToDataTable('Hello world!').should.eql('Hello world!');
    columnType.convertFileToDataTable('3a').should.eql('3a');
    columnType.convertFileToDataTable('12-00-00').should.eql('12-00-00');
    columnType.convertFileToDataTable('11/11/2016').should.eql('11/11/2016');
    columnType.convertFileToDataTable('2016-11-11T12:00:00').should.eql('2016-11-11T12:00:00');
    should.equal(columnType.convertFileToDataTable(null), null);
    should.equal(columnType.convertFileToDataTable('null'), null);
  });

  // to file

  it('Convert to file format for `boolean` type', function() {
    columnType.convertDataTableToFile('true', 'boolean').should.eql('true');
    columnType.convertDataTableToFile(true, 'boolean').should.eql('true');
    columnType.convertDataTableToFile('false', 'boolean').should.eql('false');
    columnType.convertDataTableToFile(false, 'boolean').should.eql('false');
  });

  it('Convert to file format for `number` type', function() {
    columnType.convertDataTableToFile('3', 'number').should.eql(3);
    columnType.convertDataTableToFile(3, 'number').should.eql(3);
    columnType.convertDataTableToFile('3.0', 'number').should.eql(3.0);
    columnType.convertDataTableToFile(3.0, 'number').should.eql(3.0);
    columnType.convertDataTableToFile('3.14', 'number').should.eql(3.14);
    columnType.convertDataTableToFile(3.14, 'number').should.eql(3.14);
    columnType.convertDataTableToFile('-71', 'number').should.eql(-71);
    columnType.convertDataTableToFile(-71, 'number').should.eql(-71);
    columnType.convertDataTableToFile('-7.2', 'number').should.eql(-7.2);
    columnType.convertDataTableToFile(-7.2, 'number').should.eql(-7.2);
    columnType.convertDataTableToFile('.6', 'number').should.eql(.6);
    columnType.convertDataTableToFile(.6, 'number').should.eql(.6);
  });

  it('Convert to file format for `timeofday` type', function() {
    columnType.convertDataTableToFile([0,0,0], 'timeofday').should.eql('00:00:00');
    columnType.convertDataTableToFile([8,1,59], 'timeofday').should.eql('08:01:59');
    columnType.convertDataTableToFile([12,0,0], 'timeofday').should.eql('12:00:00');
    columnType.convertDataTableToFile([23,59,59], 'timeofday').should.eql('23:59:59');
    columnType.convertDataTableToFile([12,0,0], 'timeofday').should.eql('12:00:00');
    columnType.convertDataTableToFile([12,0,0,1], 'timeofday').should.eql('12:00:00.1');
    columnType.convertDataTableToFile([12,0,0,12], 'timeofday').should.eql('12:00:00.12');
    columnType.convertDataTableToFile([12,0,0,123], 'timeofday').should.eql('12:00:00.123');
  });

  it('Convert to file format for `date` type', function() {
    columnType.convertDataTableToFile('Date(2016,10,11)', 'date').should.eql('2016-11-11');
    columnType.convertDataTableToFile('Date(1999,0,1)', 'date').should.eql('1999-01-01');
  });

  it('Convert to file format for `datetime` type', function() {
    columnType.convertDataTableToFile('Date(2016,10,11,12,0,0)', 'datetime').should.eql('2016-11-11 12:00:00');
    columnType.convertDataTableToFile('Date(1999,0,1,12,0,0,123)', 'datetime').should.eql('1999-01-01 12:00:00.123');
  });

  it('Convert to file format for `string` type', function() {
    columnType.convertDataTableToFile('Name', 'string').should.eql('Name');
    columnType.convertDataTableToFile('Hello world!', 'string').should.eql('Hello world!');
    columnType.convertDataTableToFile('3a', 'string').should.eql('3a');
    columnType.convertDataTableToFile('12-00-00', 'string').should.eql('12-00-00');
    columnType.convertDataTableToFile('11/11/2016', 'string').should.eql('11/11/2016');
    columnType.convertDataTableToFile('2016-11-11T12:00:00', 'string').should.eql('2016-11-11T12:00:00');
    should.equal(columnType.convertDataTableToFile(null, 'string'), 'null');
    columnType.convertDataTableToFile('null', 'string').should.eql('null');
  });
});
