import * as runSequence from 'run-sequence';
import {notifyLiveReload} from '../../utils';
import {join} from 'path';
import {APP_SRC} from '../../config';
import * as chokidar from 'chokidar';

export function watch(taskname: string) {
  return function () {
    chokidar.watch(join(APP_SRC, '**'),
      {ignored: /[\/\\]\./, usePolling: true}).on('change', (e:any) => {
        runSequence(taskname, () => notifyLiveReload(e));
      });
  };
}
