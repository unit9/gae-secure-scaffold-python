var gulp = require('gulp'),
  conflict = require('gulp-conflict'),
  template = require('gulp-template'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),

  appendImport = true,

  config = {
    paths: {
      dist: './src/app',
      tpl: '/templates/element'
    }
  };

gulp.task('default', function (cb) {
  var path, name, slipt, templatesPath, outputPath, bowerPath;

  // Validate arguments.
  if (gulp.args.length !== 1) {
    return console.warn('Invalid number of arguments. Usage: slush fe-polymer-element path/element-name');
  }

  path = gulp.args[0];
  if ((split = path.lastIndexOf('/')) === -1) {
    name = path;
    path = '';
  } else {
    name = path.substring(split + 1);
    path = path.substring(0, split);
  }

  if (name.indexOf('-') === -1) {
    return console.warn('Invalid element name: \'' + name + '\'. Elements need to contain a dash (\'-\').');
  }

  // Resolve paths.
  path = path + '/' + name;
  if (path.indexOf('/') === 0) {
    path = path.substring(1);
  }
  outputPath = config.paths.dist + '/elements/' + path;
  bowerPath = new Array((path.match(/\//g) || []).length + 4).join('../') + 'bower_components';
  srcPath = new Array((path.match(/\//g) || []).length + 3).join('../');
  srcPath = srcPath.substring(0, srcPath.length - 1);

  gulp.src(__dirname + config.paths.tpl + '/**/*', {cwd: __dirname, dot: true})
    .pipe(template({
      path: path,
      name: name,
      bowerPath: bowerPath,
      srcPath: srcPath
    }))
    .pipe(rename(function (path) {
      if (path.basename === 'element') {
        path.basename = name;
      }
    }))
    .pipe(conflict(outputPath))
    .pipe(gulp.dest(outputPath))
    .on('end', function () {
      if (appendImport) {
        gulp.src(config.paths.dist + '/elements/elements.jade')
          .pipe(replace('link(rel=\'import\' href=\'' + path + '/' + name + '.html\')\n', ''))
          .pipe(replace('// slush:elements', 'link(rel=\'import\', href=\'' + path + '/' + name + '.html\')\n// slush:elements'))
          .pipe(gulp.dest(config.paths.dist + '/elements/'))
          .on('end', function () {
            cb();
          });
      } else {
        console.log('**********************************');
        console.log('Please append the import manually:');
        console.log('link(rel=\'import\', href=\'/elements/' + path + '/' + name + '.html\')');
        console.log('**********************************');
        cb();
      }
    })
    .resume();
});
