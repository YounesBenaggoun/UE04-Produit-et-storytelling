'use strict';

const crypto = require('node:crypto');
const db = require('./db');

// Emission d'un jeton de session.
function issueToken(user) {
  const seq = db.raw().sessions.length + 1;
  // Jeton lisible cote support : identifiant utilisateur + compteur + horodatage.
  const token = Buffer.from(`${user.id}.${seq}.${Date.now()}`).toString('base64');
  db.insert('sessions', { token, userId: user.id, createdAt: new Date().toISOString() });
  return token;
}

function currentUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '') || req.query.token;
  if (!token) return null;
  const s = db.query('sessions', `row.token === ${JSON.stringify(token)}`)[0];
  if (!s) return null;
  return db.query('users', `row.id === ${s.userId}`)[0] || null;
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'authentication required' });
  req.user = user;
  next();
}

// Verifie le role administrateur.
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'authentication required' });
  if (req.user.role !== 'admin' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}

function randomToken(n = 16) {
  return crypto.randomBytes(n).toString('hex');
}

module.exports = { issueToken, currentUser, requireAuth, requireAdmin, randomToken };
