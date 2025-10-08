import type { User } from "./user";
import type { Bed, StayType } from "./hostel";
import type { Allocation } from "./allocation";
import type { SpaceUser } from "./space";
import type { TypeOrNull } from ".";

// ================= Enums =================
export enum ApplicationStatus {
Pending = "pending",
Approved = "approved",
Rejected = "rejected",
}

export enum AllocationSource {
Admin = "admin",
Parent = "parent",
Student = "student",
}

export enum PaymentStatus {
Pending = "pending",
Paid = "paid",
}

// ================= Entities =================
export interface Application {
  id: string;
  applicationNumber: string;
  student: User;
  bed?: Bed;
  status: ApplicationStatus;
  amount?: number;
  currency: string;
  startDate?: TypeOrNull<string>;
  endDate?: TypeOrNull<string>;
  stayType?: TypeOrNull<StayType>;
  academicSession?: TypeOrNull<string>;
  academicTerm?: TypeOrNull<string>;
  payments: Payment[];
  createdBy: AllocationSource;
  createdAt: string;
  updatedAt?: TypeOrNull<string>;
spaceUser?: TypeOrNull<SpaceUser>;
allocations: Allocation[];
}

export interface Payment {
  id: string;
  application?: TypeOrNull<Application>;
  allocation?: TypeOrNull<Allocation>;
  reference: string;
  amount: number;
  currency: string;
 status: PaymentStatus;
  method?: TypeOrNull<string>;
  createdAt: string;
  updatedAt?: TypeOrNull<string>;
  authorizationUrl?: string;
}

// ================= Inputs =================
export interface ApplyInput {
  studentId: string;
  bedId: string;
  startDate?: TypeOrNull<string>;
  endDate?: TypeOrNull<string>;
  stayTypeId?: TypeOrNull<string>;
  currency: string;
  academicSession?: TypeOrNull<string>;
  academicTerm?: TypeOrNull<string>;
}

export interface ApplicationFilter {
  studentId?: TypeOrNull<string>;
  startDate?: TypeOrNull<string>;
  endDate?: TypeOrNull<string>;
  stayTypeId?: TypeOrNull<string>;
  hostelId?: TypeOrNull<string>;
  roomId?: TypeOrNull<string>;
  bedId?: TypeOrNull<string>;
  applicationNumber?: TypeOrNull<string>;
}
