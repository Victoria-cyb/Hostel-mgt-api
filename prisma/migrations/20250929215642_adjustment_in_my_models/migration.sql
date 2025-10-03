/*
  Warnings:

  - Added the required column `availableBeds` to the `hostels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomCount` to the `hostels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."allocations" ADD COLUMN     "expectedReturn" TIMESTAMP(3),
ADD COLUMN     "leaveReason" TEXT;

-- AlterTable
ALTER TABLE "public"."hostels" ADD COLUMN     "availableBeds" INTEGER NOT NULL,
ADD COLUMN     "roomCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "resetOtp" TEXT,
ADD COLUMN     "resetOtpExpiry" TIMESTAMP(3);
