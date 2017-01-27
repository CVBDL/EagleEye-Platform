var gulp = require('gulp');
var shell = require('shelljs');

gulp.task('watch', function () {
  gulp.watch([
    'helpers/**/*.js',
    'modules/**/*.js',
    'routes/**/*.js',
    'tests/**/*.js',
    'app.js',
    'gulpfile.js'
   ], ['ci:test']);
});

gulp.task('ci:test', function () {
  shell.exec('npm test');
});
