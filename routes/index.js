'use strict';

var express = require('express');
var router = express.Router();

// define routes
router.route('/')
  .get(function(req, res) {
    res.render('index');
  });


module.exports = router;
