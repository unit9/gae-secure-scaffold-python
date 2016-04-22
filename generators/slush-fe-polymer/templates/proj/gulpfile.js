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
  $ = require('gulp-load-plugins')(),

  // Actual config object to use. Set automatically from the configs below.
  // Do not modify this line. Modify only configCommon, configDev or configProd.
  config = {},

  // Config definition. Dev and prod are overrides for the common config.
  configs = {
    common: {
      paths: {
        src: 'src/app',
        dist: 'out/static'
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
  return gulp.src([config.paths.src + '/**/*.scss', '!' + config.paths.src + '/styles/**/_assets.scss'])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass())
    .pipe(gulp.dest(config.paths.dist + '/'));
});

gulp.task('sass-watch', function (cb) {
  gulp.src([config.paths.src + '/**/*.scss', '!' + config.paths.src + '/styles/**/_assets.scss'])
    .pipe(changed(config.paths.dist + '/', {
      extension: '.css'
    }))
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass())
    .pipe(gulp.dest(config.paths.dist + '/'))
    .on('data', function (file) {
      console.log('Element style changed:', file.path);

      var pathParts = file.path.split('/');

      var elementName = pathParts[pathParts.length - 3];

      var jadeFileName = elementName + '.jade';

      var jadeDir = path.dirname(file.path).replace(__dirname + '/', '')
          .replace(config.paths.dist, config.paths.src);

      var jadeDestDir = path.join(config.paths.dist,
        path.dirname(jadeDir.substring(config.paths.src.length + 1)));

      var relatedJadeFile = path.join(jadeDir, '../', jadeFileName);

      gulp.src(relatedJadeFile)
        .pipe($.jade({
          basedir: config.paths.dist
        }))
        .pipe(gulp.dest(jadeDestDir));
    })
    .on('end', function () {
      cb();
    });
});

// Simple coffee build task.
gulp.task('coffee', function () {
  return gulp.src(config.paths.src + '/**/*.coffee')
    .pipe($.coffee())
    .pipe(gulp.dest(config.paths.dist));
});

// Simple jade build task.
gulp.task('jade', function () {
  return gulp.src(config.paths.src + '/**/*.jade')
    .pipe($.jade({
      basedir: config.paths.dist
    }))
    .pipe(gulp.dest(config.paths.dist));
});

// Simple task for coping files from source to target place
gulp.task('copy', function (cb) {
  runSequence('copy-bower', 'copy-images', cb);
});

// Simple copying bower folder build task.
gulp.task('copy-bower', function () {
  return gulp.src( './bower_components/**/*')
    .pipe(gulp.dest(config.paths.dist + '/bower_components'));
});

// Simple copying images build task.
gulp.task('copy-images', function () {
  return gulp.src(config.paths.src + '/images/**/*.png')
    .pipe(gulp.dest(config.paths.dist + '/images'));
});

// Simple post-build optimising task.
gulp.task('post-optimise', function (cb) {
  if (!argv.dev) {
    runSequence('vulcanize', 'minify-js', cb);
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

// Simple vulcanizing and crisping task.
gulp.task('vulcanize', function () {
  return gulp.src(config.paths.dist + '/elements/elements.html')
    .pipe(vulcanize({
      inlineScripts: true
    }))
    .pipe(crisper())
    .pipe(gulp.dest(config.paths.dist + '/elements'));
});

// The main build task. Its job is to build all sources and output a full build.
// This task should check whether we're building a dev or prod version and
// adjust settings accordingly.
gulp.task('build', function (cb) {
  runSequence('clean', 'sprite', 'sass', 'pre-optimise', ['coffee', 'jade', 'copy'], 'post-optimise',  cb);
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
  gulp.watch(config.paths.src + '/**/*.jade', ['jade']);
  gulp.watch(config.paths.src + '/**/*.coffee', ['coffee']);
  gulp.watch(config.paths.src + '/**/*.scss', ['sass-watch']);
  
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