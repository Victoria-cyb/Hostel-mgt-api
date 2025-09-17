-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('user', 'cit_admin');

-- CreateEnum
CREATE TYPE "public"."SpaceRole" AS ENUM ('admin', 'student', 'parent');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."BedStatus" AS ENUM ('available', 'reserved', 'occupied', 'inactive');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."AllocationStatus" AS ENUM ('reserved', 'active', 'holiday_leave', 'checked_out');

-- CreateEnum
CREATE TYPE "public"."AllocationSource" AS ENUM ('admin', 'parent', 'student');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'paid');

-- CreateTable
CREATE TABLE "public"."spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hostels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "location" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rooms" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" INTEGER,
    "status" "public"."Status" NOT NULL DEFAULT 'active',
    "hostelId" TEXT NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."beds" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "public"."BedStatus" NOT NULL DEFAULT 'available',
    "amount" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "classId" TEXT,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stay_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "stay_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."space_users" (
    "id" TEXT NOT NULL,
    "role" "public"."SpaceRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "classId" TEXT,
    "parentId" TEXT,

    CONSTRAINT "space_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "gender" "public"."Gender",
    "image" TEXT,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'pending',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "academicSession" TEXT,
    "academicTerm" TEXT,
    "createdBy" "public"."AllocationSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "stayTypeId" TEXT,
    "spaceUserId" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."allocations" (
    "id" TEXT NOT NULL,
    "allocationNumber" TEXT NOT NULL,
    "status" "public"."AllocationStatus" NOT NULL DEFAULT 'reserved',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "academicSession" TEXT,
    "academicTerm" TEXT,
    "checkInDate" TIMESTAMP(3),
    "checkOutDate" TIMESTAMP(3),
    "createdBy" "public"."AllocationSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "bedId" TEXT NOT NULL,
    "currentBedId" TEXT,
    "applicationId" TEXT NOT NULL,
    "stayTypeId" TEXT,
    "spaceUserId" TEXT,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applicationId" TEXT,
    "allocationId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hostels_spaceId_idx" ON "public"."hostels"("spaceId");

-- CreateIndex
CREATE INDEX "hostels_status_idx" ON "public"."hostels"("status");

-- CreateIndex
CREATE INDEX "hostels_gender_idx" ON "public"."hostels"("gender");

-- CreateIndex
CREATE INDEX "rooms_hostelId_idx" ON "public"."rooms"("hostelId");

-- CreateIndex
CREATE INDEX "rooms_status_idx" ON "public"."rooms"("status");

-- CreateIndex
CREATE INDEX "beds_roomId_idx" ON "public"."beds"("roomId");

-- CreateIndex
CREATE INDEX "beds_status_idx" ON "public"."beds"("status");

-- CreateIndex
CREATE INDEX "beds_classId_idx" ON "public"."beds"("classId");

-- CreateIndex
CREATE INDEX "stay_types_spaceId_idx" ON "public"."stay_types"("spaceId");

-- CreateIndex
CREATE INDEX "stay_types_startDate_endDate_idx" ON "public"."stay_types"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "classes_spaceId_idx" ON "public"."classes"("spaceId");

-- CreateIndex
CREATE INDEX "space_users_spaceId_idx" ON "public"."space_users"("spaceId");

-- CreateIndex
CREATE INDEX "space_users_role_idx" ON "public"."space_users"("role");

-- CreateIndex
CREATE INDEX "space_users_classId_idx" ON "public"."space_users"("classId");

-- CreateIndex
CREATE INDEX "space_users_parentId_idx" ON "public"."space_users"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "space_users_userId_spaceId_key" ON "public"."space_users"("userId", "spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "applications_applicationNumber_key" ON "public"."applications"("applicationNumber");

-- CreateIndex
CREATE INDEX "applications_studentId_idx" ON "public"."applications"("studentId");

-- CreateIndex
CREATE INDEX "applications_bedId_idx" ON "public"."applications"("bedId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "public"."applications"("status");

-- CreateIndex
CREATE INDEX "applications_applicationNumber_idx" ON "public"."applications"("applicationNumber");

-- CreateIndex
CREATE INDEX "applications_createdAt_idx" ON "public"."applications"("createdAt");

-- CreateIndex
CREATE INDEX "applications_stayTypeId_idx" ON "public"."applications"("stayTypeId");

-- CreateIndex
CREATE INDEX "applications_spaceUserId_idx" ON "public"."applications"("spaceUserId");

-- CreateIndex
CREATE UNIQUE INDEX "allocations_allocationNumber_key" ON "public"."allocations"("allocationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "allocations_currentBedId_key" ON "public"."allocations"("currentBedId");

-- CreateIndex
CREATE INDEX "allocations_studentId_idx" ON "public"."allocations"("studentId");

-- CreateIndex
CREATE INDEX "allocations_bedId_idx" ON "public"."allocations"("bedId");

-- CreateIndex
CREATE INDEX "allocations_status_idx" ON "public"."allocations"("status");

-- CreateIndex
CREATE INDEX "allocations_allocationNumber_idx" ON "public"."allocations"("allocationNumber");

-- CreateIndex
CREATE INDEX "allocations_applicationId_idx" ON "public"."allocations"("applicationId");

-- CreateIndex
CREATE INDEX "allocations_createdAt_idx" ON "public"."allocations"("createdAt");

-- CreateIndex
CREATE INDEX "allocations_stayTypeId_idx" ON "public"."allocations"("stayTypeId");

-- CreateIndex
CREATE INDEX "allocations_spaceUserId_idx" ON "public"."allocations"("spaceUserId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "public"."payments"("reference");

-- CreateIndex
CREATE INDEX "payments_applicationId_idx" ON "public"."payments"("applicationId");

-- CreateIndex
CREATE INDEX "payments_allocationId_idx" ON "public"."payments"("allocationId");

-- CreateIndex
CREATE INDEX "payments_reference_idx" ON "public"."payments"("reference");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "public"."payments"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."hostels" ADD CONSTRAINT "hostels_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rooms" ADD CONSTRAINT "rooms_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beds" ADD CONSTRAINT "beds_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beds" ADD CONSTRAINT "beds_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stay_types" ADD CONSTRAINT "stay_types_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_users" ADD CONSTRAINT "space_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_users" ADD CONSTRAINT "space_users_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_users" ADD CONSTRAINT "space_users_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."space_users" ADD CONSTRAINT "space_users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "public"."beds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_stayTypeId_fkey" FOREIGN KEY ("stayTypeId") REFERENCES "public"."stay_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_spaceUserId_fkey" FOREIGN KEY ("spaceUserId") REFERENCES "public"."space_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "public"."beds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_currentBedId_fkey" FOREIGN KEY ("currentBedId") REFERENCES "public"."beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_stayTypeId_fkey" FOREIGN KEY ("stayTypeId") REFERENCES "public"."stay_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allocations" ADD CONSTRAINT "allocations_spaceUserId_fkey" FOREIGN KEY ("spaceUserId") REFERENCES "public"."space_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "public"."allocations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
