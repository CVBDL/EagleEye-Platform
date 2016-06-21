/**
 * Created by MMo2 on 6/15/2016.
 */

var should = require('should')
    , DB = require('../../helpers/dbHelper')
    , fixtures = require('../fixtures/chartModule');

var chartModule = require('../../modules/chartModule');

describe('Model chart Tests', function() {

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
        chartModule.all(function(err, docs) {
            docs.length.should.eql(2);
            done();
        })
    })

    it('clear', function(done) {
        chartModule.clearCollection(function(err) {
            chartModule.all(function(err, result) {
                result.length.should.eql(0);
                done();
            })
        })
    })

    it('create', function(done) {
        var testData = {
            "chartType": "LineChart",
            "domainDataType": "string",
            "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
            "options": {
                "title": "Fruits Overview",
                "hAxis": {
                    "title": "Category"
                },
                "vAxis": {
                    "title": "Inventory"
                }
            },
            "datatable": {
                "cols": [
                    {
                        "type": "string",
                        "label": "Category"
                    },
                    {
                        "type": "number",
                        "label": "Apple"
                    },
                    {
                        "type": "number",
                        "label": "Orange"
                    }
                ],
                "rows": [
                    {
                        "c": [
                            {
                                "v": "Apple"
                            },
                            {
                                "v": 5
                            },
                            {
                                "v": 9
                            }
                        ]
                    },
                    {
                        "c": [
                            {
                                "v": "Orange"
                            },
                            {
                                "v": 7
                            },
                            {
                                "v": 3
                            }
                        ]
                    }
                ]
            }
        };
        chartModule.create(testData, function(err, id) {
            chartModule.all(function(err, docs) {
                docs.length.should.eql(3);
                for (var key in fixtures.collections.chart_collection[0]) {
                    docs[2][key].should.eql(testData[key]);
                }
                done();
            })
        })
    })

    it('remove', function(done) {
        chartModule.all(function(err, docs) {
            chartModule.remove(docs[0]._id, function(err) {
                chartModule.all(function(err, result) {
                    result.length.should.eql(1);
                    result[0]._id.should.not.eql(docs[0]._id);
                    done();
                })
            })
        })
    })
});