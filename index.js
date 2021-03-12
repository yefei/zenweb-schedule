'use strict';

const path = require('path');
const { discover } = require('@feiye/discover');
const debug = require('./lib/debug');
const { ScheduleRegister } = require('./lib/register');

/**
 * @param {import('@zenweb/core').Core} core 
 * @param {*} [options]
 */
function setup(core, options) {
  options = Object.assign({
    paths: [path.join(process.cwd(), 'app', 'schedule')],
  }, options);
  debug('options: %o', options);
  const register = new ScheduleRegister(core, options);
  Object.defineProperty(core, 'schedule', { value: register });
  if (options.paths && options.paths.length) {
    options.paths.forEach(path => {
      const count = discover(path);
      debug('load: %s %o files', path, count);
    });
  }
}

module.exports = {
  setup,
};
