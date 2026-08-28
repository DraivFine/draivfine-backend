-- AlterTable
ALTER TABLE "paiements" ADD COLUMN     "montant_arrondi" DOUBLE PRECISION,
ADD COLUMN     "pay_reference" TEXT,
ADD COLUMN     "statut_fournisseur" TEXT;

-- CreateIndex
CREATE INDEX "paiements_reference_externe_idx" ON "paiements"("reference_externe");
