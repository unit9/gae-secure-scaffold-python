import * as gulp from 'gulp';
import * as sass from 'gulp-sass';
// import * as sassLint from 'gulp-sass-lint';

import {APP_SRC} from '../../config';

export = () => {
    return gulp.src([APP_SRC + '/**/*.scss', '!' + APP_SRC + '/styles/**/_assets.scss'])
      // .pipe(sassLint())
      // .pipe(sassLint.format())
      // .pipe(sassLint.failOnError())
      .pipe(sass())
      .pipe(gulp.dest(APP_SRC + '/'));
  };
