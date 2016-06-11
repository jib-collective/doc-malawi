'use strict';

const cloudfront = require('gulp-cloudfront-invalidate');
const gulp = require('gulp');
const awspublish = require('gulp-awspublish');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

const s3Config = require('./aws.json').s3;
const cloudfrontConfig = {
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region,
  bucket: s3Config.bucket,
  distribution: require('./aws.json').cloudfront.distributionId,
  paths: [
    '/malawi/*',
  ],
};

gulp.task('styles', () => {
  return gulp.src('./assets/styles/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/styles/'));
});

gulp.task('upload', ['styles'], () => {
  let publisher = awspublish.create(s3Config);

  gulp.src([
    './de/*.html',
    './dist/**/*',
  ])
    .pipe(rename((path) => {
        path.dirname = `/malawi/de/${path.dirname}`;
        return path;
    }))
    .pipe(publisher.publish())
    .pipe(publisher.cache())
    .pipe(awspublish.reporter())
    .pipe(cloudfront(cloudfrontConfig));
});

gulp.task('watch', () => {
  gulp.watch('./assets/styles/**/*.scss', ['styles']);
});
