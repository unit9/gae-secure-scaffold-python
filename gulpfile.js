var argv = require('yargs').argv,
  gulp = require('gulp'),
  runSequence = require('run-sequence'),
  merge = require('deepmerge'),
  historyApiFallback = require('connect-history-api-fallback'),
  del = require('del'),
  browserSync = require('browser-sync'),
  sass = require('gulp-sass'),
  shell = require('gulp-shell'),
  $ = require('gulp-load-plugins')(),

  // Actual config object to use. Set automatically from the configs below.
  // Do not modify this line. Modify only configCommon, configDev or configProd.
  config = {},

  // Config definition. Dev and prod are overrides for the common config.
  configs = {
    common: {
      paths: {
        src: 'src/app',
        dist: 'out/static',
        tpl: 'out/templates'
      }
    },
    dev: {
      paths: {
        dist: '.tmp'
      }
    },
    prod: {
    }
  };

// Helper functions.
function computeConfig() {
  config = merge(configs.common, argv.dev ? configs.dev : configs.prod);
}

// Compute initial config.
computeConfig();

// Clean task. Removes the old output.
gulp.task('clean', function () {
  return del.sync([config.paths.dist]);
});

// Simple scss build task.
gulp.task('sass', function () {
  return gulp.src(config.paths.src + '/styles/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest(config.paths.dist + '/styles'));
});

// Simple coffee build task.
gulp.task('coffee', function () {
  return gulp.src(config.paths.src + '/scripts/**/*.coffee')
    .pipe($.coffee())
    .pipe(gulp.dest(config.paths.dist + '/scripts'));
});

// Simple jade build task.
gulp.task('jade', function () {
  return gulp.src(config.paths.src + '/**/*.jade')
    .pipe($.jade())
    .pipe(gulp.dest(config.paths.dist));
});

// Simple task for coping files from source to target place
gulp.task('copy', function (cb) {
  runSequence('copy-images', cb);
});

// Simple jade build task.
gulp.task('copy-images', function () {
  return gulp.src(config.paths.src + '/images/**/*.png')
    .pipe(gulp.dest(config.paths.dist + '/images'));
});

// The main build task. Its job is to build all sources and output a full build.
// This task should check whether we're building a dev or prod version and
// adjust settings accordingly.
gulp.task('build', function (cb) {
  runSequence('clean', ['coffee', 'jade', 'sass', 'copy'], cb);
});

// This task serves the output using a simple HTTP server.
// This task should be used for development only, production server is GAE.
gulp.task('serve', function () {
  return browserSync.init({
    host: '0.0.0.0',
    server: {
      baseDir: config.paths.dist,
      middleware: [historyApiFallback()],
      routes: argv.dev ? {
        '/bower_components': 'bower_components'
      } : {}
    }
  });
});

// Simple task for watching files
gulp.task('watch', function (cb) {
  runSequence('watch-fe', 'watch-be', cb);
});

// Simple task for watching Front End files
gulp.task('watch-fe', function () {
  gulp.watch(config.paths.src + '/**/*.jade', ['jade'])
    .on('change', browserSync.reload);
  gulp.watch(config.paths.src + '/scripts/**/*.coffee', ['coffee'])
    .on('change', browserSync.reload);
  gulp.watch(config.paths.src + '/styles/**/*.scss', ['sass']);
  gulp.watch(config.paths.dist + '/**/*.css').on('change', browserSync.reload);
});

// Simple task for watching Back End files
gulp.task('watch-be', function (cb) {
  gulp.watch('./src/**/*.py', ['build-python']);
});

gulp.task('build-python', shell.task('./util.sh -b'));

// The develop task builds a development version of the project and serves the
// output via HTTP.
gulp.task('dev', function (cb) {
  argv.dev = true;
  computeConfig();
  runSequence('build', 'serve', 'watch', cb);
});

// By default we build the production version.
gulp.task('default', ['build']);