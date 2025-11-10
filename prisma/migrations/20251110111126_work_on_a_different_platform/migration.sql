/*
  Warnings:

  - You are about to drop the column `studentId` on the `allocations` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `applications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."allocations" DROP CONSTRAINT "allocations_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."applications" DROP CONSTRAINT "applications_studentId_fkey";

-- DropIndex
DROP INDEX "public"."allocations_studentId_idx";

-- DropIndex
DROP INDEX "public"."applications_studentId_idx";

-- AlterTable
ALTER TABLE "public"."allocations" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "public"."applications" DROP COLUMN "studentId";
