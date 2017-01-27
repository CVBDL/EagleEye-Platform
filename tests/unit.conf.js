'use strict';

let process = require('process');

// environment settings
process.env.NODE_ENV = 'testing';
process.env.EAGLEEYE_PLATFORM_PORT = 3000;

// unit test specs
require('./modules/charts.spec');
require('./modules/chart-sets.spec');
require('./modules/excel.spec');

require('./helpers/column-types.spec');
require('./helpers/utils.spec');

require('./routes/charts.spec');
