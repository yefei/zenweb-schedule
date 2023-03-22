import * as globby from 'globby';
import * as path from 'path';
import { SetupFunction } from '@zenweb/core';
import { schedule, ScheduleRegister } from './register';
import { ScheduleOption } from './types';
export { ScheduleOption, schedule };

export default function setup(opt?: ScheduleOption): SetupFunction {
  const option = Object.assign({
    paths: ['./app/schedule'],
    disabled: process.env.ZENWEB_SCHEDULE_DISABLED === '1',
  }, opt);
  return async function schedule(setup) {
    setup.assertModuleExists('inject', '@zenweb/inject');
    setup.assertModuleExists('router', '@zenweb/router');

    setup.debug('option: %o', option);

    const scheduleRegister = new ScheduleRegister(setup.core, option);
    setup.defineCoreProperty('scheduleRegister', { value: scheduleRegister });

    if (option.paths && option.paths.length) {
      for (let d of option.paths) {
        if (d.startsWith('./')) {
          d = path.join(process.cwd(), d.slice(2));
        }
        for (const file of await globby(option.patterns || '**/*.{ts,js}', { cwd: d, absolute: true })) {
          const mod = require(file.slice(0, -3));
          for (const i of Object.values(mod)) {
            if (typeof i === 'function') {
              scheduleRegister.register(i);
            }
          }
        }
      }
    }

    setup.after(() => {
      scheduleRegister.addToCoreRouter();
    });

    setup.destroy(() => {
      scheduleRegister.destory();
    });
  }
}

declare module '@zenweb/core' {
  interface Core {
    scheduleRegister: ScheduleRegister;
  }
}
