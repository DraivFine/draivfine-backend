-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('ADMIN', 'GESTIONNAIRE_FLOTTE');

-- CreateEnum
CREATE TYPE "TypeVehicule" AS ENUM ('MOTO', 'VOITURE', 'CAMIONNETTE');

-- CreateEnum
CREATE TYPE "NiveauRisque" AS ENUM ('FAIBLE', 'MODERE', 'ELEVE', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "TypeAlerte" AS ENUM ('FREINAGE_BRUSQUE', 'ACCELERATION_BRUSQUE', 'EXCES_VITESSE', 'TRAJECTOIRE_ANORMALE', 'URGENCE', 'INCIDENT_SIGNALE');

-- CreateEnum
CREATE TYPE "StatutAlerte" AS ENUM ('NOUVELLE', 'EN_COURS', 'RESOLUE', 'IGNOREE');

-- CreateEnum
CREATE TYPE "TypeContactUrgence" AS ENUM ('PERSONNEL', 'COMMISSARIAT');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('ACTIF', 'EXPIRE', 'SUSPENDU', 'ANNULE');

-- CreateEnum
CREATE TYPE "OperateurPaiement" AS ENUM ('MTN_MOMO', 'ORANGE_MONEY');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'REUSSI', 'ECHOUE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "StatutSignalement" AS ENUM ('NOUVEAU', 'RECOUPE', 'TRAITE');

-- CreateTable
CREATE TABLE "gestionnaires" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "photo_url" TEXT,
    "role" "RoleUtilisateur" NOT NULL DEFAULT 'GESTIONNAIRE_FLOTTE',
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gestionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passagers" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "photo_url" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passagers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conducteurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT,
    "photo_url" TEXT,
    "qr_code_badge" TEXT NOT NULL,
    "gestionnaire_id" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conducteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts_urgence" (
    "id" TEXT NOT NULL,
    "passager_id" TEXT,
    "conducteur_id" TEXT,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "type" "TypeContactUrgence" NOT NULL DEFAULT 'PERSONNEL',
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contacts_urgence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicules" (
    "id" TEXT NOT NULL,
    "conducteur_id" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "type" "TypeVehicule" NOT NULL DEFAULT 'MOTO',
    "marque" TEXT,
    "modele" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trajets" (
    "id" TEXT NOT NULL,
    "conducteur_id" TEXT NOT NULL,
    "vehicule_id" TEXT NOT NULL,
    "passager_id" TEXT,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "distance_km" DOUBLE PRECISION,
    "montant" DOUBLE PRECISION,
    "en_cours" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "trajets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donnees_capteur" (
    "id" BIGSERIAL NOT NULL,
    "trajet_id" TEXT NOT NULL,
    "horodatage" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "vitesse" DOUBLE PRECISION,
    "acceleration" DOUBLE PRECISION,
    "gyroscope_x" DOUBLE PRECISION,
    "gyroscope_y" DOUBLE PRECISION,
    "gyroscope_z" DOUBLE PRECISION,

    CONSTRAINT "donnees_capteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "trajet_id" TEXT NOT NULL,
    "note_globale" DOUBLE PRECISION NOT NULL,
    "niveau_risque" "NiveauRisque" NOT NULL,
    "freinages_brusques" INTEGER NOT NULL DEFAULT 0,
    "accelerations_brusques" INTEGER NOT NULL DEFAULT 0,
    "exces_vitesse" INTEGER NOT NULL DEFAULT 0,
    "trajectoire_anormale" BOOLEAN NOT NULL DEFAULT false,
    "source_calcul" TEXT NOT NULL DEFAULT 'heuristique',
    "calcule_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "trajet_id" TEXT NOT NULL,
    "passager_id" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commentaire" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes" (
    "id" TEXT NOT NULL,
    "score_id" TEXT,
    "trajet_id" TEXT,
    "passager_id" TEXT,
    "conducteur_id" TEXT,
    "type" "TypeAlerte" NOT NULL,
    "statut" "StatutAlerte" NOT NULL DEFAULT 'NOUVELLE',
    "message" TEXT,
    "commentaire" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolue_le" TIMESTAMP(3),

    CONSTRAINT "alertes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signalements" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "telephone_temoin" TEXT,
    "conducteur_id" TEXT,
    "vehicule_id" TEXT,
    "trajet_id" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "statut" "StatutSignalement" NOT NULL DEFAULT 'NOUVEAU',
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signalements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix_mensuel" DOUBLE PRECISION NOT NULL,
    "duree_jours" INTEGER NOT NULL DEFAULT 30,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements" (
    "id" TEXT NOT NULL,
    "conducteur_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "statut" "StatutAbonnement" NOT NULL DEFAULT 'ACTIF',
    "debute_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renouvelle_le" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "abonnement_id" TEXT NOT NULL,
    "operateur" "OperateurPaiement" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XAF',
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "reference_externe" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gestionnaires_email_key" ON "gestionnaires"("email");

-- CreateIndex
CREATE UNIQUE INDEX "passagers_telephone_key" ON "passagers"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "conducteurs_telephone_key" ON "conducteurs"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "conducteurs_qr_code_badge_key" ON "conducteurs"("qr_code_badge");

-- CreateIndex
CREATE INDEX "conducteurs_gestionnaire_id_idx" ON "conducteurs"("gestionnaire_id");

-- CreateIndex
CREATE INDEX "contacts_urgence_passager_id_idx" ON "contacts_urgence"("passager_id");

-- CreateIndex
CREATE INDEX "contacts_urgence_conducteur_id_idx" ON "contacts_urgence"("conducteur_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicules_immatriculation_key" ON "vehicules"("immatriculation");

-- CreateIndex
CREATE INDEX "vehicules_conducteur_id_idx" ON "vehicules"("conducteur_id");

-- CreateIndex
CREATE INDEX "trajets_conducteur_id_debut_idx" ON "trajets"("conducteur_id", "debut");

-- CreateIndex
CREATE INDEX "trajets_vehicule_id_idx" ON "trajets"("vehicule_id");

-- CreateIndex
CREATE INDEX "trajets_passager_id_debut_idx" ON "trajets"("passager_id", "debut");

-- CreateIndex
CREATE INDEX "donnees_capteur_trajet_id_horodatage_idx" ON "donnees_capteur"("trajet_id", "horodatage");

-- CreateIndex
CREATE UNIQUE INDEX "scores_trajet_id_key" ON "scores"("trajet_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_trajet_id_key" ON "evaluations"("trajet_id");

-- CreateIndex
CREATE INDEX "evaluations_passager_id_idx" ON "evaluations"("passager_id");

-- CreateIndex
CREATE INDEX "alertes_statut_cree_le_idx" ON "alertes"("statut", "cree_le");

-- CreateIndex
CREATE INDEX "alertes_trajet_id_idx" ON "alertes"("trajet_id");

-- CreateIndex
CREATE INDEX "signalements_conducteur_id_idx" ON "signalements"("conducteur_id");

-- CreateIndex
CREATE INDEX "signalements_vehicule_id_idx" ON "signalements"("vehicule_id");

-- CreateIndex
CREATE INDEX "signalements_trajet_id_idx" ON "signalements"("trajet_id");

-- CreateIndex
CREATE INDEX "signalements_cree_le_idx" ON "signalements"("cree_le");

-- CreateIndex
CREATE INDEX "abonnements_conducteur_id_idx" ON "abonnements"("conducteur_id");

-- CreateIndex
CREATE INDEX "abonnements_plan_id_idx" ON "abonnements"("plan_id");

-- CreateIndex
CREATE INDEX "paiements_abonnement_id_idx" ON "paiements"("abonnement_id");

-- AddForeignKey
ALTER TABLE "conducteurs" ADD CONSTRAINT "conducteurs_gestionnaire_id_fkey" FOREIGN KEY ("gestionnaire_id") REFERENCES "gestionnaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts_urgence" ADD CONSTRAINT "contacts_urgence_passager_id_fkey" FOREIGN KEY ("passager_id") REFERENCES "passagers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts_urgence" ADD CONSTRAINT "contacts_urgence_conducteur_id_fkey" FOREIGN KEY ("conducteur_id") REFERENCES "conducteurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_conducteur_id_fkey" FOREIGN KEY ("conducteur_id") REFERENCES "conducteurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trajets" ADD CONSTRAINT "trajets_conducteur_id_fkey" FOREIGN KEY ("conducteur_id") REFERENCES "conducteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trajets" ADD CONSTRAINT "trajets_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trajets" ADD CONSTRAINT "trajets_passager_id_fkey" FOREIGN KEY ("passager_id") REFERENCES "passagers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donnees_capteur" ADD CONSTRAINT "donnees_capteur_trajet_id_fkey" FOREIGN KEY ("trajet_id") REFERENCES "trajets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_trajet_id_fkey" FOREIGN KEY ("trajet_id") REFERENCES "trajets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_trajet_id_fkey" FOREIGN KEY ("trajet_id") REFERENCES "trajets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_passager_id_fkey" FOREIGN KEY ("passager_id") REFERENCES "passagers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_trajet_id_fkey" FOREIGN KEY ("trajet_id") REFERENCES "trajets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_passager_id_fkey" FOREIGN KEY ("passager_id") REFERENCES "passagers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_conducteur_id_fkey" FOREIGN KEY ("conducteur_id") REFERENCES "conducteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_conducteur_id_fkey" FOREIGN KEY ("conducteur_id") REFERENCES "conducteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_trajet_id_fkey" FOREIGN KEY ("trajet_id") REFERENCES "trajets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_conducteur_id_fkey" FOREIGN KEY ("conducteur_id") REFERENCES "conducteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_abonnement_id_fkey" FOREIGN KEY ("abonnement_id") REFERENCES "abonnements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
