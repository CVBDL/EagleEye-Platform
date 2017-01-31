'use strict';

let process = require('process');

// environment settings
process.env.NODE_ENV = 'testing';
process.env.EAGLEEYE_PLATFORM_PORT = 3000;
process.env.DB_CONNECTION_URI =
  'mongodb://localhost:27017/testEagleEyeDatabase';

// modules
require('./modules/charts.spec');
require('./modules/chart-sets.spec');
require('./modules/excel.spec');

// helpers
require('./helpers/column-types.spec');
require('./helpers/utils.spec');

// routes
require('./routes/charts.spec');
