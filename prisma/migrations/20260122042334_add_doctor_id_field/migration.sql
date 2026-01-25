/*
  Warnings:

  - A unique constraint covering the columns `[doctor_id]` on the table `doctor_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctor_id` to the `doctor_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctor_profiles" ADD COLUMN     "doctor_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_doctor_id_key" ON "doctor_profiles"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_profiles_doctor_id_idx" ON "doctor_profiles"("doctor_id");
