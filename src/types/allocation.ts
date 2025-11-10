import type { TypeOrNull } from ".";
import type { Application, Payment } from "./application";
import type { Bed, StayType } from "./hostel";

// ================= Enums =================
export enum AllocationStatus {
  Reserved = "reserved",
  Active = "active",
  HolidayLeave = "holiday_leave",
  CheckedOut = "checked_out",
}

export enum AllocationSource {
  Admin = "admin",
  Parent = "parent",
  Student = "student",
}

// ================= Entities =================
export interface Allocation {
  id: string;
  allocationNumber: string;
  bed: Bed;
  status: AllocationStatus;
  startDate?: TypeOrNull<string>;
  endDate?: TypeOrNull<string>;
  stayType?: TypeOrNull<StayType>;
  academicSession?: TypeOrNull<string>;
  academicTerm?: TypeOrNull<string>;
  checkInDate?: TypeOrNull<string>;
  checkOutDate?: TypeOrNull<string>;
  application: Application;
  payments: Payment[];
  createdBy: AllocationSource;
  createdAt: string;
}

// ================= Inputs =================
export interface AllocationFilter {
  studentId?: TypeOrNull<string>;
  startDate?: TypeOrNull<string>;
  endDate?: TypeOrNull<string>;
  stayTypeId?: TypeOrNull<string>;
  hostelId?: TypeOrNull<string>;
  roomId?: TypeOrNull<string>;
  bedId?: TypeOrNull<string>;
  allocationNumber?: TypeOrNull<string>;
}
