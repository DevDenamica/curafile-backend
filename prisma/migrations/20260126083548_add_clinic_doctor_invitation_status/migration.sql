/*
  Warnings:

  - Added the required column `updated_at` to the `clinic_doctors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClinicDoctorStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "clinic_doctors" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responded_at" TIMESTAMP(3),
ADD COLUMN     "status" "ClinicDoctorStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "clinic_doctors_status_idx" ON "clinic_doctors"("status");

-- CreateIndex
CREATE INDEX "clinic_doctors_expires_at_idx" ON "clinic_doctors"("expires_at");
