import '@zenweb/inject';
import '@zenweb/router';
import '@zenweb/log';
import { ServerResponse, IncomingMessage } from 'http';
import { Context, Core, Next, Middleware } from '@zenweb/core';
import { scheduleJob, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit, Job } from 'node-schedule';
import { randomUUID } from 'crypto';
import { MethodDescriptor, makeMethodDecorator } from 'decorator-make';
import { ScheduleOption } from './types';
import { Router } from '@zenweb/router';
import { scope } from '@zenweb/inject';

const SAFE_IP = '127.0.0.1';

/**
 * 安全检查，防止外部调用
 */
async function safeCheck(ctx: Context, next: Next) {
  const startTime = Date.now();
  ctx.log.info('start');
  if (!ctx.req.socket.remoteAddress || !ctx.req.socket.remoteAddress.endsWith(SAFE_IP)) {
    ctx.throw(403);
  }
  try {
    await next();
  } catch (err:any) {
    ctx.log.child({ err }).error('error');
  } finally {
    ctx.log.info('end', Date.now() - startTime, 'ms');
  }
}

interface ScheduleMethodOption {
  rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number;
  middleware?: Middleware | Middleware[];
}

interface JobItem extends MethodDescriptor, ScheduleMethodOption {
  path: string;
}

const scheduleDecorator = makeMethodDecorator<JobItem>();

/**
 * 定时任务设定
 */
export function schedule(opt: ScheduleMethodOption) {
  return scheduleDecorator.wrap((descriptor, target) => {
    const path = `${randomUUID()}/${target.constructor.name}.${descriptor.handle.name}`;
    return Object.assign({ path }, descriptor, opt);
  });
}

export class ScheduleRegister {
  private core: Core;
  private router: Router;
  private option: ScheduleOption;
  private jobs: Job[] = [];

  constructor(core: Core, option: ScheduleOption) {
    this.core = core;
    this.router = new Router({
      prefix: '/__schedule/',
    });
    this.option = option;
  }

  /**
   * 添加定时任务到路由并启动定时器
   */
  register(target: any) {
    const methods = scheduleDecorator.getMethods(target.prototype);
    if (methods.length > 0) {
      scope('prototype', false)(target);
      for (const item of methods) {
        // 添加到路由中
        this.router.post(item.path, safeCheck, ...(item.middleware ?
          (Array.isArray(item.middleware) ? item.middleware : [item.middleware]) : []), async ctx => {
          const cls = await ctx.injector.getInstance(target);
          await ctx.injector.apply(cls, item);
        });
        if (this.option.disabled) {
          continue;
        }
        // 启用定时器
        const job = scheduleJob(item.rule, () => {
          const path = '/__schedule/' + item.path;
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
            path,
            socket: {
              remoteAddress: SAFE_IP,
              remotePort: 7001,
            },
          });
          const response = new ServerResponse(request);
          this.core.app.callback()(request, response);
        });
        this.jobs.push(job);
      }
    }
  }

  addToCoreRouter() {
    this.core.router.use(this.router.routes());
  }

  destory() {
    for (const job of this.jobs) {
      job.cancel();
    }
  }
}
