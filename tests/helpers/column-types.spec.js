'use strict';

let should = require('should');

let columnTypes = require('../../helpers/column-types');

describe('helpers: column types', function () {

  it('should infer to `null` type', function (done) {
    should.equal('null', columnTypes.infer(null));
    should.equal('null', columnTypes.infer('null'));

    done();
  });

  it('should infer to `boolean` type', function(done) {
    columnTypes.infer('true').should.eql('boolean');
    columnTypes.infer(true).should.eql('boolean');
    columnTypes.infer('false').should.eql('boolean');
    columnTypes.infer(false).should.eql('boolean');

    done();
  });

  it('should infer to `number` type', function(done) {
    columnTypes.infer('3').should.eql('number');
    columnTypes.infer(3).should.eql('number');
    columnTypes.infer('3.0').should.eql('number');
    columnTypes.infer(3.0).should.eql('number');
    columnTypes.infer('3.14').should.eql('number');
    columnTypes.infer(3.14).should.eql('number');
    columnTypes.infer('-71').should.eql('number');
    columnTypes.infer(-71).should.eql('number');
    columnTypes.infer('-7.2').should.eql('number');
    columnTypes.infer(-7.2).should.eql('number');
    columnTypes.infer('.6').should.eql('number');
    columnTypes.infer(.6).should.eql('number');

    done();
  });

  it('should infer to `timeofday` type', function(done) {
    columnTypes.infer('00:00:00').should.eql('timeofday');
    columnTypes.infer('08:01:59').should.eql('timeofday');
    columnTypes.infer('12:00:00').should.eql('timeofday');
    columnTypes.infer('23:59:59').should.eql('timeofday');
    columnTypes.infer('12:00:00.').should.eql('timeofday');
    columnTypes.infer('12:00:00.1').should.eql('timeofday');
    columnTypes.infer('12:00:00.12').should.eql('timeofday');
    columnTypes.infer('12:00:00.123').should.eql('timeofday');

    done();
  });

  it('should infer to `date` type', function(done) {
    columnTypes.infer('2016-11-11').should.eql('date');
    columnTypes.infer('1999-01-01').should.eql('date');

    done();
  });

  it('should infer to `datetime` type', function(done) {
    columnTypes.infer('2016-11-11 12:00:00').should.eql('datetime');
    columnTypes.infer('1999-01-01 12:00:00.123').should.eql('datetime');

    done();
  });

  it('should infer to `string` type', function(done) {
    columnTypes.infer('Name').should.eql('string');
    columnTypes.infer('Hello world!').should.eql('string');
    columnTypes.infer('3a').should.eql('string');
    columnTypes.infer('12-00-00').should.eql('string');
    columnTypes.infer('11/11/2016').should.eql('string');
    columnTypes.infer('2016-11-11T12:00:00').should.eql('string');

    done();
  });

  it('Convert to data table format for `boolean` type', function() {
    columnTypes.convertFileToDataTable('true').should.eql(true);
    columnTypes.convertFileToDataTable(true).should.eql(true);
    columnTypes.convertFileToDataTable('false').should.eql(false);
    columnTypes.convertFileToDataTable(false).should.eql(false);
  });

  it('Convert to data table format for `number` type', function() {
    columnTypes.convertFileToDataTable('3').should.eql(3);
    columnTypes.convertFileToDataTable(3).should.eql(3);
    columnTypes.convertFileToDataTable('3.0').should.eql(3);
    columnTypes.convertFileToDataTable(3.0).should.eql(3.0);
    columnTypes.convertFileToDataTable('3.14').should.eql(3.14);
    columnTypes.convertFileToDataTable(3.14).should.eql(3.14);
    columnTypes.convertFileToDataTable('-71').should.eql(-71);
    columnTypes.convertFileToDataTable(-71).should.eql(-71);
    columnTypes.convertFileToDataTable('-7.2').should.eql(-7.2);
    columnTypes.convertFileToDataTable(-7.2).should.eql(-7.2);
    columnTypes.convertFileToDataTable('.6').should.eql(0.6);
    columnTypes.convertFileToDataTable(.6).should.eql(.6);
  });

  it('Convert to data table format for `timeofday` type', function() {
    columnTypes.convertFileToDataTable('00:00:00').should.eql([0,0,0]);
    columnTypes.convertFileToDataTable('08:01:59').should.eql([8,1,59]);
    columnTypes.convertFileToDataTable('12:00:00').should.eql([12,0,0]);
    columnTypes.convertFileToDataTable('23:59:59').should.eql([23,59,59]);
    columnTypes.convertFileToDataTable('12:00:00.').should.eql([12,0,0]);
    columnTypes.convertFileToDataTable('12:00:00.1').should.eql([12,0,0,1]);
    columnTypes.convertFileToDataTable('12:00:00.12').should.eql([12,0,0,12]);
    columnTypes.convertFileToDataTable('12:00:00.123').should.eql([12,0,0,123]);
  });

  it('Convert to data table format for `date` type', function() {
    columnTypes.convertFileToDataTable('2016-11-11').should.eql('Date(2016,10,11)');
    columnTypes.convertFileToDataTable('1999-01-01').should.eql('Date(1999,0,1)');
  });

  it('Convert to data table format for `datetime` type', function() {
    columnTypes.convertFileToDataTable('2016-11-11 12:00:00').should.eql('Date(2016,10,11,12,0,0)');
    columnTypes.convertFileToDataTable('1999-01-01 12:00:00.123').should.eql('Date(1999,0,1,12,0,0,123)');
  });

  it('Convert to data table format for `string` type', function() {
    columnTypes.convertFileToDataTable('Name').should.eql('Name');
    columnTypes.convertFileToDataTable('Hello world!').should.eql('Hello world!');
    columnTypes.convertFileToDataTable('3a').should.eql('3a');
    columnTypes.convertFileToDataTable('12-00-00').should.eql('12-00-00');
    columnTypes.convertFileToDataTable('11/11/2016').should.eql('11/11/2016');
    columnTypes.convertFileToDataTable('2016-11-11T12:00:00').should.eql('2016-11-11T12:00:00');
    should.equal(columnTypes.convertFileToDataTable(null), null);
    should.equal(columnTypes.convertFileToDataTable('null'), null);
  });

  // to file

  it('Convert to file format for `boolean` type', function() {
    columnTypes.convertDataTableToFile('true', 'boolean').should.eql('true');
    columnTypes.convertDataTableToFile(true, 'boolean').should.eql('true');
    columnTypes.convertDataTableToFile('false', 'boolean').should.eql('false');
    columnTypes.convertDataTableToFile(false, 'boolean').should.eql('false');
  });

  it('Convert to file format for `number` type', function() {
    columnTypes.convertDataTableToFile('3', 'number').should.eql(3);
    columnTypes.convertDataTableToFile(3, 'number').should.eql(3);
    columnTypes.convertDataTableToFile('3.0', 'number').should.eql(3.0);
    columnTypes.convertDataTableToFile(3.0, 'number').should.eql(3.0);
    columnTypes.convertDataTableToFile('3.14', 'number').should.eql(3.14);
    columnTypes.convertDataTableToFile(3.14, 'number').should.eql(3.14);
    columnTypes.convertDataTableToFile('-71', 'number').should.eql(-71);
    columnTypes.convertDataTableToFile(-71, 'number').should.eql(-71);
    columnTypes.convertDataTableToFile('-7.2', 'number').should.eql(-7.2);
    columnTypes.convertDataTableToFile(-7.2, 'number').should.eql(-7.2);
    columnTypes.convertDataTableToFile('.6', 'number').should.eql(.6);
    columnTypes.convertDataTableToFile(.6, 'number').should.eql(.6);
  });

  it('Convert to file format for `timeofday` type', function() {
    columnTypes.convertDataTableToFile([0,0,0], 'timeofday').should.eql('00:00:00');
    columnTypes.convertDataTableToFile([8,1,59], 'timeofday').should.eql('08:01:59');
    columnTypes.convertDataTableToFile([12,0,0], 'timeofday').should.eql('12:00:00');
    columnTypes.convertDataTableToFile([23,59,59], 'timeofday').should.eql('23:59:59');
    columnTypes.convertDataTableToFile([12,0,0], 'timeofday').should.eql('12:00:00');
    columnTypes.convertDataTableToFile([12,0,0,1], 'timeofday').should.eql('12:00:00.1');
    columnTypes.convertDataTableToFile([12,0,0,12], 'timeofday').should.eql('12:00:00.12');
    columnTypes.convertDataTableToFile([12,0,0,123], 'timeofday').should.eql('12:00:00.123');
  });

  it('Convert to file format for `date` type', function() {
    columnTypes.convertDataTableToFile('Date(2016,10,11)', 'date').should.eql('2016-11-11');
    columnTypes.convertDataTableToFile('Date(1999,0,1)', 'date').should.eql('1999-01-01');
  });

  it('Convert to file format for `datetime` type', function() {
    columnTypes.convertDataTableToFile('Date(2016,10,11,12,0,0)', 'datetime').should.eql('2016-11-11 12:00:00');
    columnTypes.convertDataTableToFile('Date(1999,0,1,12,0,0,123)', 'datetime').should.eql('1999-01-01 12:00:00.123');
  });

  it('Convert to file format for `string` type', function() {
    columnTypes.convertDataTableToFile('Name', 'string').should.eql('Name');
    columnTypes.convertDataTableToFile('Hello world!', 'string').should.eql('Hello world!');
    columnTypes.convertDataTableToFile('3a', 'string').should.eql('3a');
    columnTypes.convertDataTableToFile('12-00-00', 'string').should.eql('12-00-00');
    columnTypes.convertDataTableToFile('11/11/2016', 'string').should.eql('11/11/2016');
    columnTypes.convertDataTableToFile('2016-11-11T12:00:00', 'string').should.eql('2016-11-11T12:00:00');
    should.equal(columnTypes.convertDataTableToFile(null, 'string'), 'null');
    columnTypes.convertDataTableToFile('null', 'string').should.eql('null');
  });
});
