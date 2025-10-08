/*
  Warnings:

  - You are about to drop the column `availableBeds` on the `hostels` table. All the data in the column will be lost.
  - You are about to drop the column `roomCount` on the `hostels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."hostels" DROP COLUMN "availableBeds",
DROP COLUMN "roomCount";
