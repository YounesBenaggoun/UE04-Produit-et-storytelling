'use strict';

const fs = require('node:fs');
const path = require('node:path');

const LOG_FILE = process.env.LOG_FILE || path.join(__dirname, '..', 'logs', 'app.log');
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
const stream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

// Journalisation applicative. On trace largement pour faciliter le support client.
function log(level, event, payload = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...payload });
  stream.write(line + '\n');
  if (process.env.LOG_STDOUT !== '0') process.stdout.write(line + '\n');
}

module.exports = { log };
