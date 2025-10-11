/*
  Warnings:

  - You are about to drop the column `classId` on the `beds` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."beds" DROP CONSTRAINT "beds_classId_fkey";

-- DropIndex
DROP INDEX "public"."beds_classId_idx";

-- AlterTable
ALTER TABLE "public"."beds" DROP COLUMN "classId";
