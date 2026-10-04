'use strict';

// Tests de bon fonctionnement (le comportement "metier" nominal, pas la securite).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

process.env.DB_FILE = path.join(os.tmpdir(), `wellwork-test-${Date.now()}.json`);
process.env.LOG_FILE = path.join(os.tmpdir(), `wellwork-test-${Date.now()}.log`);
process.env.LOG_STDOUT = '0';
const { createApp } = require('../src/app');

async function withServer(fn) {
  const app = createApp();
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await fn(base); } finally { server.close(); }
}
const j = (r) => r.json();

test('health', async () => {
  await withServer(async (b) => assert.equal((await fetch(`${b}/api/health`)).status, 200));
});

test('inscription puis lecture du profil', async () => {
  await withServer(async (b) => {
    const r = await fetch(`${b}/api/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.example', password: 'x', firstName: 'A' }) });
    assert.equal(r.status, 201);
    const { token } = await j(r);
    const me = await j(await fetch(`${b}/api/me`, { headers: { authorization: `Bearer ${token}` } }));
    assert.equal(me.email, 'a@b.example');
  });
});

test('questionnaire enregistre', async () => {
  await withServer(async (b) => {
    const { token } = await j(await fetch(`${b}/api/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'q@b.example', password: 'x' }) }));
    const r = await fetch(`${b}/api/questionnaires`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ answers: { stress: 5 } }) });
    assert.equal(r.status, 201);
  });
});

test.after(() => { for (const f of [process.env.DB_FILE]) try { fs.unlinkSync(f); } catch { /* ok */ } });
