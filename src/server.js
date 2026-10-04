'use strict';

const { createApp } = require('./app');
const { log } = require('./logger');

const PORT = process.env.PORT || 3000;
const app = createApp();
app.listen(PORT, () => log('info', 'startup', { port: Number(PORT) }));
