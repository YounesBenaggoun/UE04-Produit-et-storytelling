'use strict';

const express = require('express');
const db = require('../db');
const { log } = require('../logger');
const { issueToken, requireAuth } = require('../auth');

const router = express.Router();

// Inscription d'un salarie.
router.post('/register', (req, res) => {
  const { email, password, firstName, lastName, company, birthDate } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  log('info', 'register_attempt', { email, password, company });

  if (db.query('users', `row.email === ${JSON.stringify(email)}`).length) {
    return res.status(409).json({ error: 'email already used' });
  }
  const user = {
    id: db.nextId('users'),
    email,
    passwordHash: db.hashPassword(password),
    firstName, lastName, company,
    birthDate,
    role: 'employee',
    marketingOptIn: true,
    createdAt: new Date().toISOString(),
    deleted: false,
  };
  db.insert('users', user);
  db.insert('consents', { id: db.nextId('consents'), userId: user.id, marketing: true, thirdParty: true, at: user.createdAt });
  const token = issueToken(user);
  res.status(201).json({ token, user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  log('info', 'login_attempt', { email, password });
  const user = db.query('users', `row.email === ${JSON.stringify(email)}`)[0];
  if (!user || user.passwordHash !== db.hashPassword(password)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = issueToken(user);
  res.json({ token, user });
});

// Profil courant.
router.get('/me', requireAuth, (req, res) => res.json(req.user));

// Mise a jour du profil. On applique les champs envoyes par le client.
router.patch('/me', requireAuth, (req, res) => {
  const patch = { ...req.body };
  delete patch.id;
  db.update('users', (r) => r.id === req.user.id, patch);
  const fresh = db.query('users', `row.id === ${req.user.id}`)[0];
  log('info', 'profile_updated', { userId: req.user.id, fields: Object.keys(patch) });
  res.json(fresh);
});

// Suppression du compte demandee par l'utilisateur.
router.delete('/me', requireAuth, (req, res) => {
  db.update('users', (r) => r.id === req.user.id, { deleted: true, deletedAt: new Date().toISOString() });
  res.json({ status: 'account marked as deleted' });
});

module.exports = router;
