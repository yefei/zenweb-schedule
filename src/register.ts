import '@zenweb/inject';
import '@zenweb/router';
import { ServerResponse, IncomingMessage } from 'http';
import { Context, Next, Middleware } from 'koa';
import { Core } from '@zenweb/core';
import { scheduleJob, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from 'node-schedule';
import { randomUUID } from 'crypto';

const SAFE_IP = '127.0.0.1';
const JOBS = Symbol('Schedule#jobs');

/**
 * 安全检查，防止外部调用
 */
function safeCheck(ctx: Context, next: Next) {
  if (!ctx.req.socket.remoteAddress || !ctx.req.socket.remoteAddress.endsWith(SAFE_IP)) {
    ctx.throw(403);
  }
  return next();
}

interface ScheduleMethodOption {
  rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number;
  middleware?: Middleware | Middleware[];
}

interface JobItem extends ScheduleMethodOption {
  path: string;
  handle: (...args: any[]) => Promise<void> | void;
  params: any[];
}

/**
 * 取得对象中的任务列表
 */
export function getJobs(target: any): JobItem[] {
  return Reflect.getMetadata(JOBS, target) || [];
}

/**
 * 在对象中添加任务配置
 */
export function addJob(target: any, item: JobItem) {
  const list = [...getJobs(target), item];
  Reflect.defineMetadata(JOBS, list, target);
}

/**
 * 定时任务设定
 */
export function schedule(opt: ScheduleMethodOption) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const path = `/__schedule/${randomUUID()}/${target.constructor.name}.${propertyKey}`;
    const params = Reflect.getOwnMetadata('design:paramtypes', target, propertyKey) || [];
    addJob(target, Object.assign({
      path,
      handle: descriptor.value,
      params,
    }, opt));
  }
}

/**
 * 添加定时任务到路由并启动定时器
 */
export function registerSchedule(core: Core, target: any) {
  const jobs = getJobs(target.prototype);
  if (jobs.length > 0) {
    for (const item of jobs) {
      // 添加到路由中
      core.router.post(item.path, safeCheck, ...(item.middleware ?
        (Array.isArray(item.middleware) ? item.middleware : [item.middleware]) : []), async ctx => {
        const cls = await ctx.injector.getInstance(target);
        await ctx.injector.apply(cls, item);
      });
      // 启用定时器
      scheduleJob(item.rule, function callback() {
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
          url: item.path,
          path: item.path,
          socket: {
            remoteAddress: SAFE_IP,
            remotePort: 7001,
          },
        });
        const response = new ServerResponse(request);
        core.koa.callback()(request, response);
      });
    }
  }
}
