'use strict';

const autoprefixer = require('gulp-autoprefixer');
const cloudfront = require('gulp-cloudfront-invalidate');
const concat = require('gulp-concat');
const parallelize = require('concurrent-transform');
const cssnano = require('gulp-cssnano');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const awspublish = require('gulp-awspublish');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');
const uglify = require('gulp-uglify');

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
    './assets/vendor/iphone-inline-video/iphone-inline-video.js',
    './node_modules/video.js/dist/video.js',
    './node_modules/tocca/Tocca.js',
    './node_modules/mapbox-gl/dist/mapbox-gl.js',
    './assets/scripts/app.js',
    './assets/scripts/step.js',
    './assets/scripts/main.js',
  ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./dist/scripts/'))
});

gulp.task('html', () => {
  return gulp.src([
    './de/dev/**/*.html',
  ])
    .pipe(replace('{{url}}', '../'))
    .pipe(replace('{{version}}', ''))
    .pipe(gulp.dest('./de/'));
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

gulp.task('upload', ['styles', 'scripts', 'fonts', 'images', 'videos', 'data'], () => {
  let publisher = awspublish.create(s3Config);
  const cacheTime = (60 * 60 * 24) * 14; // 14 days
  const awsHeaders = {
    'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
  };
  const gzippable = function(file) {
    const match = file.path.match(/\.(svg|json|geojson|vtt|html|css|js)$/gi);
    return match;
  };

  let htmlStream = gulp.src([
    './de/dev/*.html',
  ])
    .pipe(rename((path) => {
        path.dirname = `/malawi/de/${path.dirname}`;
        return path;
    }))
    .pipe(replace('{{url}}', 'https://cdn.jib-collective.net/malawi/'))
    .pipe(replace('{{version}}', '?v=' + require('./package.json').version))
    .pipe(htmlmin());

  let distStream = gulp.src([
    './dist/**/*',
  ])
    .pipe(rename((path) => {
        path.dirname = `/malawi/dist/${path.dirname}`;
        return path;
    }))
    .pipe(gulpIf('*.js', uglify()));

  return merge(htmlStream, distStream)
    .pipe(gulpIf(gzippable, awspublish.gzip()))
    .pipe(publisher.cache())
    .pipe(parallelize(publisher.publish(awsHeaders), 10))
    .pipe(awspublish.reporter())
    .pipe(cloudfront(cloudfrontConfig));
});

gulp.task('watch', () => {
  gulp.watch('./assets/styles/**/*.scss', ['styles']);
  gulp.watch('./assets/scripts/**/*.js', ['scripts']);
  gulp.watch('./assets/images/**/*.svg', ['images']);
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
