/*
  Warnings:

  - You are about to drop the column `countyResidence` on the `patients` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "countyResidence",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "chronicConditions" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "countryResidence" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "zipCode" TEXT;
