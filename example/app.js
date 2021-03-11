'use strict';

process.env.DEBUG = '*';

const app = module.exports = require('zenweb').create();
app.setup(require('..').setup);
app.start();
