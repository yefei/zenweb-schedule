import { Core } from '@zenweb/core';
import modInject from '@zenweb/inject';
import modRouter from '@zenweb/router';
import modLog from '@zenweb/log';
import modSchedule from '../src';

const app = new Core();
app.setup(modInject());
app.setup(modRouter());
app.setup(modLog());
app.setup(modSchedule({
  // disabled: true,
}));
app.start();
