'use strict';

let config;

try {
  config = require('./config.json');
} catch(err) {
  config = {
    facebookAppId: process.env.FB_APP_ID || '',
    googleAnalyticsId: process.env.GA_ID || '',
    mapboxAppId: process.env.MAPBOX_APP_ID || '',
  };
}

const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');

gulp.task('styles', () => {
  return gulp.src([
    './node_modules/mapbox-gl/dist/mapbox-gl.css',
    './assets/styles/main.scss',
  ])
    .pipe(gulpIf('*.scss', sass().on('error', sass.logError)))
    .pipe(concat('main.css'))
    .pipe(autoprefixer({
      browsers: [
        'last 2 versions',
        'iOS 7',
      ]
    }))
    .pipe(cssnano({
      zindex: false,
    }))
    .pipe(gulp.dest('./dist/styles/'));
});

gulp.task('scripts', () => {
  return gulp.src([
    './node_modules/jquery/dist/jquery.slim.js',
    './node_modules/screenfull/dist/screenfull.js',
    './node_modules/video.js/dist/video.js',
    './node_modules/tocca/Tocca.js',
    './node_modules/mapbox-gl/dist/mapbox-gl.js',
    './assets/scripts/app.js',
    './assets/scripts/step.js',
    './assets/scripts/main.js',
  ])
    .pipe(babel({
        plugins: [
          'transform-runtime',
        ]
    }))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./dist/scripts/'))
});

gulp.task('html', () => {
  return gulp.src([
    './de/dev/**/*.html',
  ])
    .pipe(replace('{{url}}', ''))
    .pipe(replace('{{version}}', ''))
    .pipe(replace('{{facebookAppId}}', config.facebookAppId))
    .pipe(replace('{{googleAnalyticsId}}', config.googleAnalyticsId))
    .pipe(replace('{{mapboxAppId}}', config.mapboxAppId))
    .pipe(gulp.dest('dist/de/'));
});

gulp.task('videos', () => {
  return gulp.src([
    './assets/videos/**/*',
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

gulp.task('watch', () => {
  gulp.watch('./assets/styles/**/*.scss', ['styles']);
  gulp.watch('./assets/scripts/**/*.js', ['scripts']);
  gulp.watch('./assets/images/**/*.svg', ['images']);
  gulp.watch('./assets/data/**/*', ['data']);
  gulp.watch('./de/**/*.html', ['html']);
});

gulp.task('default', [
  'html',
  'styles',
  'scripts',
  'videos',
  'images',
  'fonts',
  'data',
]);
