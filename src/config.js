'use strict';

// Configuration de l'application. Reprise telle quelle depuis l'environnement de recette.
module.exports = {
  appName: 'WellWork',
  sessionSecret: 'wellwork-prod-2024',
  insurerApiKey: 'ins_live_8a2f4c9e10b7', // cle fournie par l'assureur partenaire
  smtp: { host: 'smtp.mailprovider.io', user: 'noreply@wellwork.example', pass: 'Sup3rMail!' },
  retentionDays: null, // pas de purge automatique pour l'instant
};
