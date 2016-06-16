'use strict';

const cloudfront = require('gulp-cloudfront-invalidate');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const awspublish = require('gulp-awspublish');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');

const s3Config = require('./aws.json').s3;
const cloudfrontConfig = {
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region,
  bucket: s3Config.bucket,
  distribution: require('./aws.json').cloudfront.distributionId,
  paths: [
    '/malawi/de/*',
    '/malawi/dist/*',
  ],
};

gulp.task('styles', () => {
  return gulp.src([
    './node_modules/mapbox-gl/dist/mapbox-gl.css',
    './assets/styles/main.scss',
  ])
    .pipe(gulpIf('*.scss', sass().on('error', sass.logError)))
    .pipe(concat('main.css'))
    .pipe(cssnano({
      autoprefixer: true,
      zindex: false,
    }))
    .pipe(gulp.dest('./dist/styles/'));
});

gulp.task('scripts', () => {
  return gulp.src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/screenfull/dist/screenfull.js',
    './node_modules/hammerjs/hammer.js',
    './node_modules/video.js/dist/video.js',
    './node_modules/gsap/src/uncompressed/TweenLite.js',
    './node_modules/gsap/src/uncompressed/TimelineLite.js',
    './node_modules/gsap/src/uncompressed/plugins/CSSPlugin.js',
    './node_modules/mapbox-gl/dist/mapbox-gl.js',
    './assets/scripts/step.js',
    './assets/scripts/main.js',
  ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/scripts/'))
});

gulp.task('videos', () => {
  return gulp.src([
    './assets/videos/**/*.mp4',
  ])
    .pipe(gulp.dest('./dist/videos/'));
});

gulp.task('fonts', () => {
  return gulp.src([
    './assets/fonts/**/*',
  ])
    .pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('data', () => {
  return gulp.src([
    './assets/data/**/*',
  ])
    .pipe(gulp.dest('./dist/data/'));
});

gulp.task('images', () => {
  const svgSpriteConfig = {
    mode: {
      css: false,
      defs: {
        dest: '',
        sprite: './sprite.svg',
      },
      stack: false,
      symbol: false,
      view: false,
    },
  };

  return gulp.src([
    './assets/images/**/*',
  ])
    .pipe(imagemin())
    .pipe(gulpIf('*.svg', svgSprite(svgSpriteConfig)))
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('upload', ['styles'], () => {
  let publisher = awspublish.create(s3Config);

  gulp.src([
    './de/*.html',
  ])
    .pipe(rename((path) => {
        path.dirname = `/malawi/de/${path.dirname}`;
        return path;
    }))
    .pipe(publisher.publish())
    .pipe(publisher.cache())
    .pipe(awspublish.reporter())
    .pipe(cloudfront(cloudfrontConfig));

    gulp.src([
      './dist/**/*',
    ])
      .pipe(rename((path) => {
          path.dirname = `/malawi/dist/${path.dirname}`;
          return path;
      }))
      .pipe(publisher.publish())
      .pipe(publisher.cache())
      .pipe(awspublish.reporter())
      .pipe(cloudfront(cloudfrontConfig));
});

gulp.task('watch', () => {
  gulp.watch('./assets/styles/**/*.scss', ['styles']);
  gulp.watch('./assets/scripts/**/*.js', ['scripts']);
});

gulp.task('default', [
  'styles',
  'scripts',
  'videos',
  'images',
  'fonts',
  'data',
]);
