'use strict';

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { currentUser } = require('./auth');
const accounts = require('./routes/accounts');
const data = require('./routes/data');

function createApp() {
  db.load();
  const app = express();
  app.use(express.json());
  app.use(cors()); // ouvert a toutes les origines pour faciliter l'integration des partenaires
  app.use(express.static(require('node:path').join(__dirname, '..', 'public')));

  // Rend l'utilisateur courant disponible sans imposer l'authentification a chaque route.
  app.use((req, _res, next) => { req.user = currentUser(req); next(); });

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', accounts);
  app.use('/api', data);

  return app;
}

module.exports = { createApp };
