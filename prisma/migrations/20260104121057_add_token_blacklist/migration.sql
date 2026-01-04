-- CreateEnum
CREATE TYPE "LogoutReason" AS ENUM ('LOGOUT', 'LOGOUT_ALL_DEVICES', 'PASSWORD_CHANGED', 'SECURITY', 'ACCOUNT_DEACTIVATED');

-- CreateTable
CREATE TABLE "token_blacklist" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reason" "LogoutReason" NOT NULL DEFAULT 'LOGOUT',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_token_key" ON "token_blacklist"("token");

-- CreateIndex
CREATE INDEX "token_blacklist_token_idx" ON "token_blacklist"("token");

-- CreateIndex
CREATE INDEX "token_blacklist_patientId_idx" ON "token_blacklist"("patientId");

-- CreateIndex
CREATE INDEX "token_blacklist_expiresAt_idx" ON "token_blacklist"("expiresAt");

-- AddForeignKey
ALTER TABLE "token_blacklist" ADD CONSTRAINT "token_blacklist_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
