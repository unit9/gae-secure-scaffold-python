var  gulp = require('gulp');

// This is just a temporary gulpfile
gulp.task('info', function (cb) {
  console.warn('This script is empty. Run slush generator first!');
  cb();
});

gulp.task('dev', ['info']);

gulp.task('build', ['info']);

gulp.task('default', ['build']);