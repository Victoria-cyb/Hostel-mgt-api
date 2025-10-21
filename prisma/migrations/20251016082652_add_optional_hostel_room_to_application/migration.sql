-- AlterTable
ALTER TABLE "public"."applications" ADD COLUMN     "hostelId" TEXT,
ADD COLUMN     "roomId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
