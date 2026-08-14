-- À exécuter manuellement une fois après la première migration Prisma
-- (Prisma ne gère pas la création d'hypertables TimescaleDB).

CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable(
  'donnees_capteur',
  'horodatage',
  migrate_data => true,
  if_not_exists => true
);

-- Politique de rétention optionnelle : purge des données brutes après 90 jours
-- (le score de synthèse, lui, reste indéfiniment dans la table "scores").
-- SELECT add_retention_policy('donnees_capteur', INTERVAL '90 days');

-- Compression automatique des chunks de plus de 7 jours (optionnel, économise l'espace)
-- ALTER TABLE donnees_capteur SET (timescaledb.compress, timescaledb.compress_segmentby = 'trajet_id');
-- SELECT add_compression_policy('donnees_capteur', INTERVAL '7 days');
