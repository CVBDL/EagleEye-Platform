'use strict';

// environment settings
process.env.NODE_ENV = 'test';
process.env.EAGLEEYE_PLATFORM_PORT = 3000;
process.env.DB_CONNECTION_URI =
  'mongodb://localhost:27017/eagleeye_test';

// modules
require('./modules/chart.spec');
require('./modules/chart-set.spec');
require('./modules/task.spec');
require('./modules/job.spec');
require('./modules/file-parser.spec');
require('./modules/data-table.spec');
require('./modules/error-handler.spec');
require('./modules/column-type.spec');

// helpers
require('./helpers/utils.spec');

// routes
require('./routes/charts.spec');
require('./routes/chart-sets.spec');
require('./routes/tasks.spec');
require('./routes/jobs.spec');
require('./routes/root-endpoint.spec');

// main
require('./app.spec');
