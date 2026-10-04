'use strict';

const express = require('express');
const db = require('../db');
const { log } = require('../logger');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// Questionnaire de sante rempli par le salarie.
router.post('/questionnaires', requireAuth, (req, res) => {
  const q = {
    id: db.nextId('questionnaires'),
    userId: req.user.id,
    answers: req.body.answers || {}, // poids, sommeil, stress, antecedents, traitements...
    at: new Date().toISOString(),
  };
  db.insert('questionnaires', q);
  res.status(201).json(q);
});

// Consultation d'un utilisateur par identifiant.
router.get('/users/:id', requireAuth, (req, res) => {
  const u = db.query('users', `row.id === ${Number(req.params.id)}`)[0];
  if (!u) return res.status(404).json({ error: 'not found' });
  const questionnaires = db.query('questionnaires', `row.userId === ${Number(req.params.id)}`);
  res.json({ ...u, questionnaires });
});

// Recherche annuaire pour les coachs et les RH.
router.get('/users', requireAuth, (req, res) => {
  const { filter } = req.query; // ex : filter=row.company === 'ACME'
  const rows = db.query('users', filter);
  res.json(rows);
});

// Messagerie coach / salarie.
router.post('/messages', requireAuth, (req, res) => {
  const m = { id: db.nextId('messages'), from: req.user.id, to: Number(req.body.to), body: req.body.body, at: new Date().toISOString() };
  db.insert('messages', m);
  res.status(201).json(m);
});
router.get('/messages', requireAuth, (req, res) => {
  res.json(db.query('messages', `row.to === ${req.user.id} || row.from === ${req.user.id}`));
});

// Export vers l'assureur partenaire.
router.get('/exports/insurer', requireAuth, requireAdmin, (req, res) => {
  const rows = db.raw().users.map((u) => ({
    ...u,
    questionnaires: db.query('questionnaires', `row.userId === ${u.id}`),
  }));
  db.insert('exports', { id: db.nextId('exports'), by: req.user.id, at: new Date().toISOString(), count: rows.length });
  log('info', 'insurer_export', { by: req.user.id, count: rows.length });
  res.json(rows);
});

module.exports = router;
