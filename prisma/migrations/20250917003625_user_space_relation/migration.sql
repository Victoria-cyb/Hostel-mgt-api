/*
  Warnings:

  - Added the required column `createdById` to the `spaces` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."space_users" DROP CONSTRAINT "space_users_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."space_users" DROP CONSTRAINT "space_users_userId_fkey";

-- AlterTable
ALTER TABLE "public"."spaces" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."spaces" ADD CONSTRAINT "spaces_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_users" ADD CONSTRAINT "space_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_users" ADD CONSTRAINT "space_users_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
