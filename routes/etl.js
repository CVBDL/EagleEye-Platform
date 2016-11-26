'use strict';

let express = require('express');
let etl     = require('../modules/etl');

let router = express.Router();


// define routes
router.route('/etl')

  // list all the endpoint categories
  .get(function getEtl(req, res) {
    etl.start();
    res.status(204).send('');
  });


module.exports = router;
