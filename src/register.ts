'use strict';

const schedule = require('node-schedule');
const { ServerResponse } = require('http');

const SAFE_IP = '127.0.0.1';

/**
 * 安全检查，防止外部调用
 * @param {import('koa').Context} ctx
 * @param {import('koa').Middleware} next
 */
function safeCheck(ctx, next) {
  if (!ctx.req.socket.remoteAddress || !ctx.req.socket.remoteAddress.endsWith(SAFE_IP)) {
    ctx.throw(403);
  }
  return next();
}

class ScheduleRegister {
  /**
   * @param {import('@zenweb/core').Core} core
   * @param {object} [options]
   * @param {(req, res, callback: (req, res) => void) => void} [options.jobCallback] 自定义任务调用
   */
  constructor(core, options) {
    this.options = options || {};
    this.router = core.router;
    this.callback = core.koa.callback();
    this._index = 0;
  }

  job(...args) {
    let name = '';
    let rule;

    if (typeof args[1] === 'string') {
      name = args[0];
      rule = args[1];
      args = args.slice(2);
    } else {
      rule = args[0];
      args = args.slice(1);
    }

    // 注册到路由
    const path = `/___schedule/job/${this._index++}/${name}`;
    this.router.post(path, safeCheck, ...args);

    // 注册到 scheduleJob
    const jobArgs = [];
    if (name) jobArgs.push(name);
    jobArgs.push(rule);
    jobArgs.push(() => {
      const request = {
        headers: {
          host: '127.0.0.1',
        },
        query: {},
        querystring: '',
        host: '127.0.0.1',
        hostname: '127.0.0.1',
        protocol: 'http',
        secure: 'false',
        method: 'POST',
        url: path,
        path: path,
        socket: {
          remoteAddress: SAFE_IP,
          remotePort: 7001,
        },
      };
      const response = new ServerResponse(request);
      if (this.options.jobCallback) {
        this.options.jobCallback(request, response, this.callback);
      } else {
        this.callback(request, response);
      }
    });
    return schedule.scheduleJob(...jobArgs);
  }
}

module.exports = {
  ScheduleRegister,
};
