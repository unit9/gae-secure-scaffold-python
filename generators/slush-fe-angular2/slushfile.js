'use strict';

var gulp = require('gulp'),
  install = require('gulp-install'),
  template = require('gulp-template'),
  rename = require('gulp-rename'),
  _ = require('underscore.string'),
  inquirer = require('inquirer'),
  runSequence = require('run-sequence'),
  conflict = require('gulp-conflict'),
  path = require('path'),



  config = {
    paths: {
      dist: './src/app',
      app: '/templates/app',
      proj: '/templates/proj',
      tpl: '/templates/component'
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
  gulp.src([__dirname + config.paths.proj + '/**'])
    .pipe(rename(function (file) {
      if (file.basename[0] === '*') {
        file.basename = '.' + file.basename.slice(1);
      }
    }))
    .pipe(gulp.dest('./'))
    .pipe(install())
    .on('end', function () {
      cb();
    });
});

// Simple task for generating project. Generates project content files
gulp.task('templatize-app', function (cb) {
  gulp.src([__dirname + config.paths.app + '/**'])
    .pipe(rename(function (file) {
      if (file.basename[0] === '*') {
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
  runSequence(['templatize-app', 'templatize-project-files'], cb);
});

//Additional generator task. Generates component
gulp.task('component', function (cb) {
  var path, name, split, outputPath, bowerPath, srcPath, nameBase, camelName;

  // Validate arguments.
  if (gulp.args.length !== 1) {
    return console.warn('Invalid number of arguments. Usage: slush fe-angular2:component path/element-name');
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

  nameBase = name.substring(1 + name.indexOf('-'));

  // Resolve paths.
  path = path + '/' + nameBase;
  if (path.indexOf('/') === 0) {
    path = path.substring(1);
  }
  outputPath = config.paths.dist + '/' + path;
  bowerPath = new Array((path.match(/\//g) || []).length + 4).join('../') + 'bower_components';
  srcPath = new Array((path.match(/\//g) || []).length + 3).join('../');
  srcPath = srcPath.substring(0, srcPath.length - 1);
  camelName = _.capitalize(nameBase);

  gulp.src(__dirname + config.paths.tpl + '/**/*.*', {cwd: __dirname, dot: true})
    .pipe(template({
      path: path,
      name: name,
      nameBase: nameBase,
      camelName: camelName,
      bowerPath: bowerPath,
      srcPath: srcPath
    }))
    .pipe(rename({
      basename: name
    }))
    .pipe(conflict(outputPath))
    .pipe(gulp.dest(outputPath))
    .on('end', function () {
      console.log('**********************************');
      console.log('Please append the import manually:');
      console.log('import {' + camelName + 'Component} from \'../' + path + '/' + name + '\';');
      console.log('And add ' + camelName + 'Component to directives');
      console.log('**********************************');
      cb();
    })
    .resume();
});
