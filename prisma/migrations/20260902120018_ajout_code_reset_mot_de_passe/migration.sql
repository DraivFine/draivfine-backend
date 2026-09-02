-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "code_reset_expire" TIMESTAMP(3),
ADD COLUMN     "code_reset_hash" TEXT;
