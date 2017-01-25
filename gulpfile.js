var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('watch', function () {
  gulp.watch([
    'helpers/**/*.js',
    'modules/**/*.js',
    'routes/**/*.js',
    'tests/**/*.js',
    'gulpfile.js'
   ], ['ci:test']);
});

gulp.task('ci:test', function (cb) {
  exec('npm test', function (error, stdout, stderr) {
    if (!error) {
      console.log(stdout);
    } else {
      console.log(stderr);
    }
    cb();
  })
});
