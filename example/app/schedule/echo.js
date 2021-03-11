'use strict';

const app = require('../../app');

app.schedule.job('*/1 * * * * *', ctx => {
  console.log('task echo');
  ctx.body = 'ok';
});
