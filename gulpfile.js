'use strict';

const gulp = require('gulp');
const gzip = require('gulp-gzip');
const s3 = require('gulp-s3');

const awsConfig = require('./aws.json');

gulp.task('upload', () => {
  gulp.src('./de/*.html', {read: false})
    .pipe(s3(awsConfig));
});
