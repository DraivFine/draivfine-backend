/*
  Warnings:

  - The primary key for the `donnees_capteur` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "donnees_capteur" DROP CONSTRAINT "donnees_capteur_pkey",
ADD CONSTRAINT "donnees_capteur_pkey" PRIMARY KEY ("id", "horodatage");
