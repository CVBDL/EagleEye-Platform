/**
 * Created by MMo2 on 6/14/2016.
 */
var express = require('express');
var router = express.Router();

var dbLearnModule = require('../modules/dbLearnLogic');

var chatModule = require('../modules/chartModule');

/* GET users listing. */
router.get('/', function(req, res, next) {
    dbLearnModule.all(function(err, docs) {
        res.send(docs);
    });
});

router.get('/create', function (req, res, next) {
    dbLearnModule.create("apple", "test", function(err, docs) {
        res.send(docs);
    });
});
router.post('/create', function (req, res, next) {
    chatModule.create(req.body, function(err, result) {
       res.send(result);
    });
});

router.get('/remove', function (req, res, next) {
   dbLearnModule.remove('575f9fc61f505ae0468d6ec9', function(err) {
       if (err) res.send(err.message);
       else res.send("remove success.");
   });
});

router.get('', function(req, res, next) {
    
})

module.exports = router;