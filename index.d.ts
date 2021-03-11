import { Middleware } from 'koa';
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

declare module '@zenweb/core' {
  interface Core {
    schedule: ScheduleRegister;
  }
}
