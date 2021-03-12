'use strict';

process.env.DEBUG = '*';

const app = module.exports = require('zenweb').create();
app.setup(require('..').setup, {
  jobCallback(request, response, callback) {
    callback(request, response);
  }
});
app.start();
