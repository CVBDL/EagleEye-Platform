'use strict';

// environment settings
process.env.NODE_ENV = 'test';
process.env.EAGLEEYE_PLATFORM_PORT = 3000;
process.env.DB_CONNECTION_URI =
  'mongodb://localhost:27017/eagleeye_test';

// modules
require('./modules/charts.spec');
require('./modules/chart-sets.spec');
require('./modules/file-parser.spec');
require('./modules/data-table.spec');
require('./modules/tasks.spec');

// helpers
require('./helpers/column-types.spec');
require('./helpers/utils.spec');
require('./helpers/error-handlers.spec');

// routes
require('./routes/charts.spec');
require('./routes/chart-sets.spec');
require('./routes/root-endpoint.spec');

// main
require('./app.spec');
