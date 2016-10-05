// Generated on 2016-06-06 using generator-angular 0.15.1
'use strict';

var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Define the configuration for all the tasks
  grunt.initConfig({
    webpack: {
      app: {
        entry: "./app.js",
        target: 'node',
        node: {
          __dirname: false,
          __filename: false,
        },
        externals: [nodeExternals({
          modulesFromFile: true
        })],
        output: {
          path: "dist/",
          filename: 'app.js'
        },
        module: {
          loaders: [
            { test: /\.json$/, loader: "json" },
            { test: /\.xml$/, loader: "xml" }
          ]
        }
      }
    },
    copy: {
      app: {
        files: [{
          expand: true,
          dot: true,
          cwd: './',
          dest: 'dist/',
          src: [
            'config.json',
            'package.json',
            '*.html',
            'excelPath/**/*',
            'tools/**/*',
            'public/**/*'
          ]
        }]
      }
    }
  });

  grunt.registerTask('default', 'Pack app', function(target) {
    grunt.task.run([
      'webpack:app',
      'copy'
    ]);
  });

};
