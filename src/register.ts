import '@zenweb/router';
import { ServerResponse, IncomingMessage } from 'http';
import { Context, Next, Middleware } from 'koa';
import { Core } from '@zenweb/core';
import { RequestCallback, ScheduleOption } from './types';
import { Router } from '@zenweb/router';
import { scheduleJob, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from 'node-schedule';

const SAFE_IP = '127.0.0.1';

/**
 * 安全检查，防止外部调用
 */
function safeCheck(ctx: Context, next: Next) {
  if (!ctx.req.socket.remoteAddress || !ctx.req.socket.remoteAddress.endsWith(SAFE_IP)) {
    ctx.throw(403);
  }
  return next();
}

export class ScheduleRegister {
  option: ScheduleOption;
  router: Router;
  callback: RequestCallback;
  private _index: number;

  constructor(core: Core, option?: ScheduleOption) {
    this.option = option || {};
    this.router = core.router;
    this.callback = core.koa.callback();
    this._index = 0;
  }

  job(
    rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number,
    ...middleware: Middleware[]
    ) {
    // 注册到路由
    const path = `/___schedule/job/${this._index++}`;
    this.router.post(path, safeCheck, ...middleware);

    // 注册到 scheduleJob
    const callback = () => {
      const request: IncomingMessage = Object.assign({
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
      });
      const response = new ServerResponse(request);
      if (this.option.jobCallback) {
        this.option.jobCallback(request, response, this.callback);
      } else {
        this.callback(request, response);
      }
    };
    return scheduleJob(rule, callback);
  }
}
