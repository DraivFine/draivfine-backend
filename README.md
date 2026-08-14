# Moto Safety — Backend NestJS

API de la plateforme de scoring comportemental des conducteurs (moto safety) :
suivi de trajets, ingestion de données capteurs, scoring (ML + heuristiques),
alertes et bouton d'urgence, abonnements et paiement mobile money.

## Stack

- **NestJS** (TypeScript), architecture modulaire
- **PostgreSQL** + **TimescaleDB** (table `donnees_capteur`) via **Prisma**
- **Redis** + **BullMQ** pour le scoring asynchrone
- **Socket.io** (NestJS Gateway) pour la position en direct et le bouton d'urgence
- Microservice **ML séparé (FastAPI)**, appelé via HTTP — hors périmètre de ce dossier

## Structure des modules

```
src/
  auth/            # JWT dashboard (gestionnaires/admin)
  conducteurs/      # conducteurs + badge QR
  vehicules/
  trajets/          # démarrage/fin de trajet, déclenche le scoring
  capteurs/         # ingestion batch accéléromètre/GPS
  scoring/          # worker BullMQ, client ML, fallback heuristique
  alertes/          # alertes de score + bouton d'urgence (SMS/push/WS en parallèle)
  notifications/    # SMS (Twilio/Africa's Talking) + push (FCM) — à brancher
  realtime/         # Gateway Socket.io (position, urgence)
  abonnements/
  paiements/        # MTN MoMo / Orange Money — providers à brancher
  prisma/           # PrismaService global
  config/           # configuration centralisée (.env)
```

## Démarrage local

```bash
cp .env.example .env    # puis ajuster les valeurs
npm install
docker compose up -d postgres redis   # ou tes instances existantes

npx prisma migrate dev --name init
# puis, une seule fois, exécuter prisma/timescale.sql sur la base
# (Prisma ne gère pas la création d'hypertable TimescaleDB)

npm run start:dev
```

L'API démarre sur `http://localhost:3000/api/v1` (versionnée via l'URI, ex.
`/api/v1/conducteurs`). Le gateway websocket écoute sur le namespace
`/realtime`.

## Points d'attention

- **Scoring non bloquant** : `TrajetsService.terminer()` répond immédiatement
  et pousse un job dans la queue BullMQ `scoring` ; `ScoringProcessor` calcule
  le score en tâche de fond et enregistre les alertes si besoin.
- **Fallback ML → heuristiques** : `MlClientService` tente le microservice
  FastAPI (`ML_SERVICE_URL`) ; en cas d'échec ou de timeout, et si
  `SCORING_FALLBACK_TO_HEURISTICS=true`, `HeuristiquesService` prend le relais
  (seuils configurables dans `scoring/scoring.constants.ts`).
- **Bouton d'urgence** : `AlertesService.creerUrgence()` diffuse en parallèle
  (websocket, SMS aux contacts d'urgence, push au gestionnaire) via
  `Promise.allSettled` — l'échec d'un canal ne bloque jamais les autres.
- **Paiement mobile money** : `MomoProvider` et `OrangeMoneyProvider` sont des
  squelettes prêts à brancher sur les API réelles (identifiants dans `.env`).
  Le webhook `POST /api/v1/paiements/webhook/:referenceExterne/:statut` doit
  être sécurisé par vérification de signature avant mise en production.
- **TimescaleDB** : la table `donnees_capteur` doit être convertie en
  hypertable après la première migration Prisma — voir `prisma/timescale.sql`.

## Prochaines étapes suggérées

1. Créer un `Utilisateur` admin initial (seed) pour se connecter au dashboard.
2. Brancher réellement Twilio/Africa's Talking, firebase-admin, MoMo/Orange.
3. Écrire le microservice FastAPI de scoring ML (`POST /scoring/predict`).
4. Ajouter les tests e2e sur les flux critiques (fin de trajet → score → alerte,
   bouton d'urgence).
