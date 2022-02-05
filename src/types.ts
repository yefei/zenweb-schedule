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

  jobCallback?: JobCallback;
}
