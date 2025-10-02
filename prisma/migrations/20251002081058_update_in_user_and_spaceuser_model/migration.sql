-- DropForeignKey
ALTER TABLE "public"."space_users" DROP CONSTRAINT "space_users_parentId_fkey";

-- AddForeignKey
ALTER TABLE "public"."space_users" ADD CONSTRAINT "space_users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."space_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
