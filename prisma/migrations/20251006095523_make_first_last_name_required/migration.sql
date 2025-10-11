/*
  Warnings:

  - Made the column `firstName` on table `space_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `space_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."space_users" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;
