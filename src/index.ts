import * as globby from 'globby';
import * as path from 'path';
import { SetupFunction } from '@zenweb/core';
import { registerSchedule, schedule } from './register';
import { ScheduleOption } from './types';
export { ScheduleOption, schedule };

export default function setup(option?: ScheduleOption): SetupFunction {
  option = Object.assign({
    paths: [path.join(process.cwd(), 'app', 'schedule')],
  }, option);
  return async function schedule(setup) {
    setup.checkCoreProperty('injector', '@zenweb/inject');
    setup.checkCoreProperty('router', '@zenweb/router');
    setup.debug('option: %o', option);
    setup.defineCoreProperty('schedule', { value: true });
    if (option.paths && option.paths.length) {
      for (const d of option.paths) {
        for (const file of await globby(option.patterns || '**/*.{ts,js}', { cwd: d, absolute: true })) {
          const mod = require(file.slice(0, -3));
          for (const i of Object.values(mod)) {
            if (typeof i === 'function') {
              registerSchedule(setup.core, i);
            }
          }
        }
      }
    }
  }
}
