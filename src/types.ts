import { ServerResponse, IncomingMessage } from 'http';

export type RequestCallback = (request: IncomingMessage, response: ServerResponse) => void;
export type JobCallback = (request: IncomingMessage, response: ServerResponse, callback: RequestCallback) => void;

export interface ScheduleOption {
  paths?: string[];
  jobCallback?: JobCallback;
}
