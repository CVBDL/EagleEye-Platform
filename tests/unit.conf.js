'use strict';

let process = require('process');

// environment settings
process.env.NODE_ENV = 'testing';
process.env.EAGLEEYE_PLATFORM_PORT = 3000;

// modules
require('./modules/charts.spec');
require('./modules/chart-sets.spec');
require('./modules/excel.spec');

// helpers
require('./helpers/column-types.spec');
require('./helpers/utils.spec');

// routes
require('./routes/charts.spec');
