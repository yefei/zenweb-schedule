import * as globby from 'globby';
import { SetupFunction } from '@zenweb/core';
import path = require('path');
import { ScheduleRegister } from './register';
import { ScheduleOption } from './types';
export * from './types';

export default function setup(option?: ScheduleOption): SetupFunction {
  return async function schedule(setup) {
    option = Object.assign({
      paths: [path.join(process.cwd(), 'app', 'schedule')],
    }, option);
    setup.debug('option: %o', option);
    const register = new ScheduleRegister(setup.core, option);
    setup.defineCoreProperty('schedule', { value: register });
    if (option.paths && option.paths.length) {
      for (const d of option.paths) {
        let count = 0;
        for (const m of await globby(option.patterns || '**/*.{ts,js}', { cwd: d, absolute: true })) {
          require(m);
          count++;
        }
        setup.debug('load: %s %o files', d, count);
      }
    }
  }
}

declare module '@zenweb/core' {
  interface Core {
    schedule: ScheduleRegister;
  }
}
