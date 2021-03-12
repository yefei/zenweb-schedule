import { Middleware } from 'koa';
import { Core } from '@zenweb/core';
import { ServerResponse, IncomingMessage } from 'http';
import { RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit, Job } from 'node-schedule';

declare class ScheduleRegister<StateT = any, CustomT = {}> {
  job(
    rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number,
    ...middleware: Middleware<StateT, CustomT>[]
  ): Job;

  job(
    name: string,
    rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number,
    ...middleware: Middleware<StateT, CustomT>[]
  ): Job;
}

export interface ScheduleOptions {
  paths?: string[];
  jobCallback?: (request: IncomingMessage, response: ServerResponse, callback: (request: IncomingMessage, response: ServerResponse) => void) => void;
}

export declare function setup(core: Core, options?: ScheduleOptions): void;

declare module '@zenweb/core' {
  interface Core {
    schedule: ScheduleRegister;
  }
}
