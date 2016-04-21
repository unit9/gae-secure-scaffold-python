'use strict';

var gulp = require('gulp'),
  install = require('gulp-install'),
  template = require('gulp-template'),
  rename = require('gulp-rename'),
  _ = require('underscore.string'),
  inquirer = require('inquirer'),
  runSequence = require('run-sequence'),
  conflict = require('gulp-conflict'),
  replace = require('gulp-replace'),
  path = require('path'),



  config = {
    paths: {
      dist: './src/app',
      app: '/templates/app',
      proj: '/templates/proj',
      tpl: '/templates/element'
    },
    appendImport: true
  };

function format(string) {
  var username = string.toLowerCase();
  return username.replace(/\s/g, '');
}

var defaults = (function () {
  var workingDirName = path.basename(process.cwd()),
    homeDir, osUserName, configFile, user;

  if (process.platform === 'win32') {
    homeDir = process.env.USERPROFILE;
    osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
  }
  else {
    homeDir = process.env.HOME || process.env.HOMEPATH;
    osUserName = homeDir && homeDir.split('/').pop() || 'root';
  }

  configFile = path.join(homeDir, '.gitconfig');
  user = {};

  if (require('fs').existsSync(configFile)) {
    user = require('iniparser').parseSync(configFile).user;
  }

  return {
    appName: workingDirName,
    userName: osUserName || format(user.name || ''),
    authorName: user.name || '',
    authorEmail: user.email || ''
  };
})();

// Simple task for generating project. Generates project main files
gulp.task('templatize-project-files', function (cb) {
  gulp.src([__dirname + config.paths.proj + '/**/*.*'])
    .pipe(template(config.answers))
    .pipe(rename(function (file) {
      if (file.basename[0] === '-') {
        file.basename = '.' + file.basename.slice(1);
      }
    }))
    .pipe(gulp.dest('./'))
    .pipe(install())
    .on('end', function () {
      cb();
    });
});

// Simple task for generating project. Copies binary files
gulp.task('copy-files', function () {
  return gulp.src([__dirname + config.paths.app + '/**/*.png'])
    .pipe(gulp.dest(config.paths.dist + '/'));
});

// Simple task for generating project. Generates project content files
gulp.task('templatize-app', function (cb) {
  gulp.src([__dirname + config.paths.app + '/**', '!' + __dirname + config.paths.app + '/**/*.png'])
    .pipe(template(config.answers))
    .pipe(rename(function (file) {
      if (file.basename[0] === '-') {
        file.basename = '.' + file.basename.slice(1);
      }
    }))
    .pipe(gulp.dest(config.paths.dist + '/'))
    .pipe(install())
    .on('end', function () {
      cb();
    });
});

//Default generator task. Generates project scaffold
gulp.task('default', function (cb) {
  var prompts = [{
    name: 'appName',
    message: 'What is the name of your project?',
    default: defaults.appName
  }, {
    name: 'authorName',
    message: 'What is the author name?',
    default: defaults.authorName
  }, {
    name: 'authorEmail',
    message: 'What is the author email?',
    default: defaults.authorEmail
  }];
  //Ask
  inquirer.prompt(prompts,
    function (answers) {
      answers.appNameSlug = _.slugify(answers.appName);
      config.answers = answers;
      runSequence('copy-files', ['templatize-app', 'templatize-project-files'], cb);
    });
});

//Additional generator task. Generates component
gulp.task('element', function (cb) {
  var path, name, split, outputPath, bowerPath, srcPath;

  // Validate arguments.
  if (gulp.args.length !== 1) {
    return console.warn('Invalid number of arguments. Usage: slush fe-polymer:element path/element-name');
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
      if (config.appendImport) {
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
