-- Backfill des comptes existants créés avant que le mot de passe ne soit
-- obligatoire (hash bcrypt d'un placeholder, sans valeur en clair connue —
-- ces comptes devront passer par "mot de passe oublié" pour se reconnecter).
UPDATE "utilisateurs"
SET "mot_de_passe_hash" = '$2b$10$fgElBjnmQ5PmyYNIHT.tW.1RR6NbfjzVt.zkAcjxcDJ1K4zhegVXS'
WHERE "mot_de_passe_hash" IS NULL;

-- AlterTable
ALTER TABLE "utilisateurs" ALTER COLUMN "mot_de_passe_hash" SET NOT NULL;
