/*
 * slush-fe-static
 * https://github.com/krzysztofnowak/slush-fe-static
 *
 * Copyright (c) 2016, Krzysztof Nowak
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    runSequence = require('run-sequence'),
    path = require('path'),

    config = {
      paths: {
        dist: ''
      }
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

gulp.task('copy-files', function (cb) {
  return gulp.src([__dirname + '/templates/**/*.png'])
    .pipe(gulp.dest('./'));
});

gulp.task('templatize', function (cb) {
  gulp.src([__dirname + '/templates/**', '!' + __dirname + '/templates/**/*.png'])
    .pipe(template(config))
    .pipe(rename(function (file) {
      if (file.basename[0] === '*') {
        file.basename = '.' + file.basename.slice(1);
      }
    }))
    .pipe(conflict('./'))
    .pipe(gulp.dest('./'))
    .pipe(install())
    .on('end', function () {
      cb();
    });
});

gulp.task('default', function (cb) {
    var prompts = [{
        name: 'appName',
        message: 'What is the name of your project?',
        default: defaults.appName
    // }, {
    //     name: 'authorName',
    //     message: 'What is the author name?',
    //     default: defaults.authorName
    // }, {
    //     name: 'authorEmail',
    //     message: 'What is the author email?',
    //     default: defaults.authorEmail
    }];
    //Ask
    inquirer.prompt(prompts,
        function (answers) {
            answers.appNameSlug = _.slugify(answers.appName);
            config = answers;
            runSequence('copy-files', 'templatize', cb);
        });
});
