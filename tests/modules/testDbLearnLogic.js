/**
 * Created by MMo2 on 6/14/2016.
 */
var should = require('should')
    , DB = require('../../helpers/dbHelper')
    , fixtures = require('../fixtures/dbLearnLogic');

var dbLearn = require('../../modules/dbLearnLogic');

describe('Model DbLearn Tests', function() {

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
        dbLearn.all(function(err, docs) {
            docs.length.should.eql(3);
            done();
        })
    })

    it('create', function(done) {
        dbLearn.create('Famous Person', 'I am so famous!', function(err, id) {
            dbLearn.all(function(err, docs) {
                docs.length.should.eql(4);
                docs[3]._id.should.eql(id);
                docs[3].name.should.eql('Famous Person');
                docs[3].text.should.eql('I am so famous!');
                done();
            })
        })
    })

    it('remove', function(done) {
        dbLearn.all(function(err, docs) {
            dbLearn.remove(docs[0]._id, function(err) {
                dbLearn.all(function(err, result) {
                    result.length.should.eql(2);
                    result[0]._id.should.not.eql(docs[0]._id);
                    result[1]._id.should.not.eql(docs[0]._id);
                    done();
                })
            })
        })
    })
});