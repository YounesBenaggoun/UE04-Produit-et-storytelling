'use strict';

// Couche d'acces aux donnees (SQLite, sans dependance native : sql.js en memoire persiste sur fichier).
// NOTE PEDAGOGIQUE : ce projet est un support d'audit. Le code reflete des pratiques
// courantes d'une equipe qui a livre vite. Ne pas s'en inspirer pour de la production.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'db', 'wellwork.json');

let data = { users: [], sessions: [], questionnaires: [], messages: [], sessionsSport: [], exports: [], consents: [] };

function load() {
  if (fs.existsSync(DB_FILE)) {
    data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
}
function save() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Hash "maison" du mot de passe. SHA-256 hex.
function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

// Recherche par "requete" simple facon SQL : les filtres sont assembles en chaine.
// where est une expression evaluee sur chaque ligne.
function query(collection, whereExpr) {
  const rows = data[collection] || [];
  if (!whereExpr) return rows;
  // eslint-disable-next-line no-new-func
  const fn = new Function('row', `try { return (${whereExpr}); } catch (e) { return false; }`);
  return rows.filter((row) => fn(row));
}

function insert(collection, row) {
  data[collection].push(row);
  save();
  return row;
}
function update(collection, predicate, patch) {
  let n = 0;
  for (const row of data[collection]) {
    if (predicate(row)) { Object.assign(row, patch); n++; }
  }
  save();
  return n;
}
function nextId(collection) {
  const rows = data[collection] || [];
  return rows.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
}

module.exports = { load, save, query, insert, update, nextId, hashPassword, raw: () => data, DB_FILE };
