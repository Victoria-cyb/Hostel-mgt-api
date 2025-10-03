/*
  Warnings:

  - Made the column `status` on table `beds` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."beds" ALTER COLUMN "status" SET NOT NULL;
