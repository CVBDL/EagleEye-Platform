'use strict';

let should = require('should');

let columnTypes = require('../../helpers/column-types');

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
