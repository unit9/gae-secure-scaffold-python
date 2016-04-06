'use strict';

var argv = require('yargs').argv,
  gulp = require('gulp'),
  runSequence = require('run-sequence'),
  merge = require('deepmerge'),
  historyApiFallback = require('connect-history-api-fallback'),
  del = require('del'),
  browserSync = require('browser-sync'),
  sass = require('gulp-sass'),
  sassLint = require('gulp-sass-lint'),
  shell = require('gulp-shell'),
  bump = require('gulp-bump'),
  spritesmith = require('gulp.spritesmith'),
  path = require('path'),
  changed = require('gulp-changed'),
  vulcanize = require('gulp-vulcanize'),
  crisper = require('gulp-crisper'),
  cleanCSS = require('gulp-clean-css'),
  uglify = require('gulp-uglify'),
  webpack = require('webpack'),
  WebpackServer = require('webpack-dev-server'),
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
      },
      webpack: './webpack.dev.config'
    },
    prod: {
      paths: {},
      webpack: './webpack.prod.config'
    },
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
  return gulp.src([config.paths.src + '/**/*.scss', '!' + config.paths.src + '/styles/**/_assets.scss'])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass())
    .pipe(gulp.dest(config.paths.dist + '/'));
});

// Simple coffee build task.
gulp.task('typescript', function (cb) {
  if (argv.dev) {
    return gulp.src(config.paths.src + '/**/*.ts')
      .pipe(gulp.dest(config.paths.dist + '/'));
  } else {
    cb();
  }
});

// Simple task for coping files from source to target place
gulp.task('copy', function (cb) {
  runSequence('copy-bower', 'copy-html', 'copy-images', cb);
});

// Simple copying bower folder build task.
gulp.task('copy-bower', function () {
  return gulp.src( './bower_components/**/*')
    .pipe(gulp.dest(config.paths.dist + '/bower_components'));
});

// Simple html task.
gulp.task('copy-html', function () {
  return gulp.src(config.paths.src + '/**/*.html')
    .pipe(gulp.dest(config.paths.dist + '/'));
});

// Simple copying images build task.
gulp.task('copy-images', function () {
  return gulp.src(config.paths.src + '/images/**/*.png')
    .pipe(gulp.dest(config.paths.dist + '/images'));
});

// Simple post-build optimising task.
gulp.task('post-optimise', function (cb) {
  if (!argv.dev) {
    runSequence('minify-js', cb);
  } else {
    cb();
  }
});

// Simple pre-build optimising task.
gulp.task('pre-optimise', function (cb) {
  if (!argv.dev) {
    runSequence('minify-css', cb);
  } else {
    cb();
  }
});

// Simple minifying js files task.
gulp.task('minify-js', function() {
  return gulp.src(config.paths.dist + '/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(config.paths.dist));
});

// Simple minifying css files task.
gulp.task('minify-css', function() {
  return gulp.src(config.paths.dist + '/**/*.css')
    .pipe(cleanCSS({}))
    .pipe(gulp.dest(config.paths.dist));
});


// The main build task. Its job is to build all sources and output a full build.
// This task should check whether we're building a dev or prod version and
// adjust settings accordingly.
gulp.task('build', function (cb) {
  runSequence('clean', 'sprite', 'sass', 'pre-optimise', ['typescript', 'copy'], 'post-optimise',  cb);
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
        '/bower_components': 'bower_components',
        '/node_modules': 'node_modules',
        '/angular2': 'node_modules/angular2'
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
  gulp.watch(config.paths.src + '/**/*.html', ['copy-html']);
  gulp.watch(config.paths.src + '/**/*.ts', ['typescript']);
  gulp.watch(config.paths.src + '/**/*.scss', ['sass']);
  
  gulp.watch(config.paths.dist + '/**/*.css').on('change', browserSync.reload);
  gulp.watch(config.paths.dist + '/**/*.js').on('change', browserSync.reload);
  gulp.watch(config.paths.dist + '/**/*.html').on('change', browserSync.reload);
});

// Simple task for watching Back End files
gulp.task('watch-be', function (cb) {
  gulp.watch('./src/**/*.py', ['build-python']);
});

// This task runs shell script created to build python project
gulp.task('build-python', shell.task('./util.sh -b'));

// Simple task for bumping app version
gulp.task('bump', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('sprite', function () {
  return gulp.src(config.paths.src + '/images/sprite/*.png')
    .pipe(spritesmith({
      imgName: '/images/sprite.png',
      cssName: '/styles/base/_assets.scss',
      // imgPath: '/images/sprite.png',
      // retinaImgName: 'sprite@2x.png',
      // retinaImgPath: '/images/sprite@2x.png',
      // retinaSrcFilter: [PATHS.SRC + '/images/sprite/*@2x.png'],
      padding: 10
    }))
    .pipe(gulp.dest(config.paths.src + '/app/'));
});

// The develop task builds a development version of the project and serves the
// output via HTTP.
gulp.task('dev', function (cb) {
  argv.dev = true;
  computeConfig();
  runSequence('build', 'serve', 'watch', cb);
});

// By default we build the production version.
gulp.task('default', function (cb) {
  runSequence('bump', 'build', cb)
});