import { ServerResponse, IncomingMessage } from 'http';

export type RequestCallback = (request: IncomingMessage, response: ServerResponse) => void;
export type JobCallback = (request: IncomingMessage, response: ServerResponse, callback: RequestCallback) => void;

export interface ScheduleOption {
  /**
   * 加载 schedule 文件目录，默认: ./app/schedule
   */
  paths?: string[];

  /**
   * 文件匹配规则，默认: ** /*.{ts,js}
   */
  patterns?: string;

  /**
   * 是否禁用定时器
   * 如禁用只注册到路由而不自动执行
   * 可以通过环境变量 ZENWEB_SCHEDULE_DISABLED=1 控制
   * 
   * @default false
   */
  disabled?: boolean;
}
