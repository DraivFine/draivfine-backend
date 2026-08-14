-- CreateEnum
CREATE TYPE "TypeUtilisateur" AS ENUM ('PASSAGER', 'CONDUCTEUR', 'GESTIONNAIRE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "type" "TypeUtilisateur" NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "mot_de_passe_hash" TEXT,
    "photo_url" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- Migrate existing profile data into the new base table BEFORE the columns
-- are dropped from the concrete tables below (préserve les comptes déjà créés).
INSERT INTO "utilisateurs" ("id", "type", "nom", "telephone", "mot_de_passe_hash", "photo_url", "cree_le")
SELECT "id", 'CONDUCTEUR', "nom", "telephone", "mot_de_passe_hash", "photo_url", "cree_le" FROM "conducteurs";

INSERT INTO "utilisateurs" ("id", "type", "nom", "telephone", "mot_de_passe_hash", "photo_url", "cree_le")
SELECT "id", 'PASSAGER', "nom", "telephone", "mot_de_passe_hash", "photo_url", "cree_le" FROM "passagers";

INSERT INTO "utilisateurs" ("id", "type", "nom", "telephone", "mot_de_passe_hash", "photo_url", "cree_le")
SELECT "id", 'GESTIONNAIRE', "nom", NULL, "mot_de_passe_hash", "photo_url", "cree_le" FROM "gestionnaires";

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_telephone_key" ON "utilisateurs"("telephone");

-- DropIndex
DROP INDEX "conducteurs_telephone_key";

-- DropIndex
DROP INDEX "passagers_telephone_key";

-- AlterTable
ALTER TABLE "conducteurs" DROP COLUMN "cree_le",
DROP COLUMN "mot_de_passe_hash",
DROP COLUMN "nom",
DROP COLUMN "photo_url",
DROP COLUMN "telephone";

-- AlterTable
ALTER TABLE "gestionnaires" DROP COLUMN "cree_le",
DROP COLUMN "mot_de_passe_hash",
DROP COLUMN "nom",
DROP COLUMN "photo_url",
ADD COLUMN     "entreprise" TEXT;

-- AlterTable
ALTER TABLE "passagers" DROP COLUMN "cree_le",
DROP COLUMN "mot_de_passe_hash",
DROP COLUMN "nom",
DROP COLUMN "photo_url",
DROP COLUMN "telephone";

-- AddForeignKey
ALTER TABLE "gestionnaires" ADD CONSTRAINT "gestionnaires_id_fkey" FOREIGN KEY ("id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passagers" ADD CONSTRAINT "passagers_id_fkey" FOREIGN KEY ("id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conducteurs" ADD CONSTRAINT "conducteurs_id_fkey" FOREIGN KEY ("id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
