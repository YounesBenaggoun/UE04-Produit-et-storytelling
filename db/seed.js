'use strict';

// Peuple la base de demonstration.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'wellwork.json');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

// PRNG deterministe pour un jeu de donnees stable.
let s = 12345;
const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = (a) => a[Math.floor(rnd() * a.length)];

const firstNames = ['Julie', 'Karim', 'Sophie', 'Marc', 'Lea', 'Antoine', 'Nadia', 'Hugo', 'Chloe', 'Yanis', 'Emma', 'Paul'];
const lastNames = ['Martin', 'Bernard', 'Dubois', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent'];
const companies = ['ACME', 'Northwind', 'Globex'];
const antecedents = ['aucun', 'asthme', 'diabete type 2', 'hypertension', 'anxiete', 'lombalgie chronique'];
const traitements = ['aucun', 'ventoline', 'metformine', 'anxiolytique', 'antihypertenseur'];

const users = [];
const questionnaires = [];
const consents = [];
const sessions = [];

function addUser(u) {
  const id = users.length + 1;
  const user = { id, role: 'employee', marketingOptIn: true, createdAt: '2024-02-10T09:00:00.000Z', deleted: false, ...u };
  users.push(user);
  consents.push({ id, userId: id, marketing: true, thirdParty: true, at: user.createdAt });
  return user;
}

// Comptes de reference
const admin = addUser({ email: 'admin@wellwork.example', passwordHash: sha('Admin2024!'), firstName: 'Admin', lastName: 'System', company: 'WellWork', role: 'admin', birthDate: '1985-05-20' });
addUser({ email: 'rh@acme.example', passwordHash: sha('AcmeRh2024'), firstName: 'Rachel', lastName: 'Hays', company: 'ACME', role: 'rh', birthDate: '1979-11-02' });
addUser({ email: 'coach@wellwork.example', passwordHash: sha('coach123'), firstName: 'Coach', lastName: 'Vaillant', company: 'WellWork', role: 'coach', birthDate: '1990-03-15' });

// 60 salaries
for (let i = 0; i < 60; i++) {
  const fn = pick(firstNames);
  const ln = pick(lastNames);
  const company = pick(companies);
  const u = addUser({
    email: `${fn}.${ln}${i}@${company}.example`.toLowerCase(),
    passwordHash: sha(pick(['Password1', 'Bienvenue2024', 'azerty123', 'Sport2024!', 'Soleil34'])),
    firstName: fn, lastName: ln, company,
    birthDate: `19${60 + Math.floor(rnd() * 40)}-${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}`,
    deleted: rnd() < 0.1,
  });
  const nq = 1 + Math.floor(rnd() * 3);
  for (let j = 0; j < nq; j++) {
    questionnaires.push({
      id: questionnaires.length + 1,
      userId: u.id,
      answers: {
        poidsKg: 55 + Math.floor(rnd() * 45),
        tailleCm: 155 + Math.floor(rnd() * 40),
        sommeilH: 4 + Math.floor(rnd() * 5),
        stress: 1 + Math.floor(rnd() * 10),
        antecedents: pick(antecedents),
        traitement: pick(traitements),
        tabac: rnd() < 0.25,
      },
      at: '2024-03-05T10:00:00.000Z',
    });
  }
}

// Une session administrateur active laissee en base
sessions.push({ token: Buffer.from(`${admin.id}.1.1709800000000`).toString('base64'), userId: admin.id, createdAt: '2024-03-01T08:00:00.000Z' });

const data = { users, sessions, questionnaires, messages: [], sessionsSport: [], exports: [], consents };
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
console.log(`Base ecrite : ${users.length} utilisateurs, ${questionnaires.length} questionnaires -> ${DB_FILE}`);
