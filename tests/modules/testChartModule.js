/**
 * Created by MMo2 on 6/15/2016.
 */
'use strict';

let should = require('should'),
    DB = require('../../helpers/dbHelper'),
    fixtures = require('../fixtures/chartModule');

let chartModule = require('../../modules/chartModule');

describe('Model chart Tests', function () {
    let chart = {
        "timestamp": 1465891633478,
        "lastUpdateTimestamp": 1465891842059,
        "chartType": "LineChart",
        "domainDataType": "string",
        "friendlyUrl": "c-eagleeye",
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
                {"type": "string", "label": "Category"},
                {"type": "number", "label": "Apple"},
                {"type": "number", "label": "Orange"}
            ],
            "rows": [
                {"c": [{"v": "Apple"}, {"v": 5}, {"v": 9}]},
                {"c": [{"v": "Orange"}, {"v": 7}, {"v": 3}]}
            ]
        }
    };

    before(function (done) {
        DB.connect(DB.MODE_TEST, done);
    });

    beforeEach(function (done) {
        DB.drop(function (err) {
            if (err) {
                return done(err);
            }

            DB.fixtures(fixtures, done);
        });
    });

    it('all', function (done) {
        chartModule.all(function (err, docs) {
            docs.length.should.eql(2);
            done();
        });
    });

    it('clear', function (done) {
        chartModule.clearCollection(function (err, result) {
            chartModule.all(function (err, result) {
                result.length.should.eql(0);
                done();
            });
        });
    });

    it('create', function (done) {
        chartModule.create(chart, function (err, id) {
            chartModule.all(function (err, docs) {
                docs.length.should.eql(3);

                for (let key in fixtures.collections.chart_collection[0]) {
                    docs[2][key].should.eql(chart[key]);
                }

                done();
            });
        });
    });

    it('getOne: id', function (done) {
        chartModule.create(chart, function (err, id) {
            chartModule.getOne(id, function (err, docs) {
                docs.length.should.eql(1);

                for (let key in fixtures.collections.chart_collection[0]) {
                    docs[0][key].should.eql(chart[key]);
                }

                done();
            });
        });
    });

    it('getOne: friendlyUrl', function (done) {
        chartModule.getOne(fixtures.collections.chart_collection[0].friendlyUrl, function (err, docs) {
            docs.length.should.eql(1);

            for (let key in fixtures.collections.chart_collection[0]) {
                docs[0][key].should.eql(fixtures.collections.chart_collection[0][key]);
            }

            done();
        });
    });

    it('updateOne', function (done) {
        chartModule.updateOne(fixtures.collections.chart_collection[0].friendlyUrl, {friendlyUrl: "c-friendlyUrl"}, function (err, result) {
            chartModule.getOne("c-friendlyUrl", function (err, docs) {
                docs.length.should.eql(1);
                done();
            });
        });
    });

    it('remove', function (done) {
        chartModule.all(function (err, docs) {
            chartModule.remove(docs[0]._id, function (err) {
                chartModule.all(function (err, result) {
                    result.length.should.eql(1);
                    result[0]._id.should.not.eql(docs[0]._id);
                    done();
                });
            });
        });
    });

    it('getChartOptionById', function (done) {
        let friendlyUrl = fixtures.collections.chart_collection[0].friendlyUrl;

        chartModule.getChartOptionById(friendlyUrl, function (err, docs) {
            docs.length.should.eql(1);
            should(docs[0].options).have.property("title","Fruits Overview");
            done();
        });
    });

    it('updateChartOptionById', function (done) {
        let friendlyUrl = fixtures.collections.chart_collection[0].friendlyUrl;
        let testOptions = {
            "title": "Fruits Overview",
            "hAxis": {
                "title": "CategoryAAA"
            },
            "vAxis": {
                "title": "Price"// update it
            }
        };

        chartModule.updateChartOptionById(friendlyUrl, testOptions, function (err, result) {
            chartModule.getOne(friendlyUrl, function (err, docs) {
                docs.length.should.eql(1);
                should(docs[0].options.vAxis.title).eql('Price');
                done();
            });
        });
    });

    it('getChartDataTableById', function (done) {
        let friendlyUrl = fixtures.collections.chart_collection[0].friendlyUrl;

        chartModule.getChartDataTableById(friendlyUrl, function (err, docs) {
            docs.length.should.eql(1);
            done();
        });
    });

    it('updateChartDataTableById', function (done) {
        let friendlyUrl = fixtures.collections.chart_collection[0].friendlyUrl;
        let testDataTable = {
            "cols": [{
                "type": "string",
                "label": "Category"
            }, {
                "type": "number",
                "label": "value1"
            }, {
                "type": "number",
                "label": "value2"
            }],
            "rows": [{
                "c": [{
                    "v": "Apple"
                }, {
                    "v": 5
                }, {
                    "v": 9
                }]
            }, {
                "c": [{
                    "v": "Orange"
                }, {
                    "v": 7
                }, {
                    "v": 3
                }]
            }, {//add a new row
                "c": [{
                    "v": "Lemon"
                }, {
                    "v": 4
                }, {
                    "v": 5
                }]
            }]
        };

        chartModule.updateChartDataTableById(friendlyUrl, testDataTable, function (err, result) {
            chartModule.getOne(friendlyUrl, function (err, docs) {
                docs[0].datatable.rows.length.should.eql(3);
                done();
            });
        });
    });
});
