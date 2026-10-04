# WellWork

Plateforme B2B de bien-être au travail. Les salariés des entreprises clientes créent un compte, remplissent un questionnaire de santé, échangent avec des coachs. Les RH disposent d'un annuaire, et un assureur partenaire reçoit des exports.

> Support pédagogique fourni pour un exercice d'audit. Base de démonstration, données fictives.

## Lancer

```bash
npm ci
npm run seed        # génère db/wellwork.json (63 comptes, questionnaires)
npm start           # http://localhost:3000
npm test
npm run lint
```

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@wellwork.example | Admin2024! |
| RH (ACME) | rh@acme.example | AcmeRh2024 |
| Coach | coach@wellwork.example | coach123 |

Les 60 salariés utilisent des mots de passe communs (jeu de démonstration).

## API

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/register` | inscription |
| POST | `/api/login` | connexion |
| GET | `/api/me` | profil courant |
| PATCH | `/api/me` | mise à jour du profil |
| DELETE | `/api/me` | suppression du compte |
| POST | `/api/questionnaires` | envoi d'un questionnaire de santé |
| GET | `/api/users/:id` | consultation d'un utilisateur |
| GET | `/api/users?filter=...` | recherche annuaire |
| POST/GET | `/api/messages` | messagerie |
| GET | `/api/exports/insurer` | export vers l'assureur |

## Stack

Node.js, Express, stockage fichier JSON (aucune base à installer). Front statique dans `public/`.
