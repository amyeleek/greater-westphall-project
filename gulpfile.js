'use strict';

const gulp    = require('gulp');
const mocha   = require('gulp-mocha');
const eslint  = require('gulp-eslint');
const nodemon = require('gulp-nodemon');

const paths = ['*.js', 'lib/*.js', 'controller/*.js', 'route/*.js', 'model/*.js', 'test/*.js'];

gulp.task('mocha', function(){
  return gulp.src(paths)
  .pipe(mocha());
});

gulp.task('eslint', function(){
  return gulp.src(paths)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task('test', function(){
  return gulp.src('./test/*-test.js', {read: false})
  .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('nodemon', function(){
  nodemon({
    ext: 'js',
    script: 'server.js'
  });
});

gulp.task('default', ['test', 'eslint']);
