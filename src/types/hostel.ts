import type { TypeOrNull } from ".";
import type { Allocation } from "./allocation";
import type { Class, Space } from "./space";

// ================= Enums =================
export enum BedStatus {
  Available = "available",
  Reserved = "reserved",
  Occupied = "occupied",
  Inactive = "inactive",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export enum Status {
  Active = "active",
  Inactive = "inactive",
}

// ================= Entities =================
export interface PublicHostel {
  id: string;
  name: string;
  gender: Gender;
  location?: TypeOrNull<string>;
  status: Status;
  roomCount: number;
  availableBeds: number;
}

export interface Hostel {
  id: string;
  space: Space;
  name: string;
  gender: Gender;
  location?: TypeOrNull<string>;
  status: Status;
  rooms: Room[];
  createdAt: string;
}

export interface Room {
  id: string;
  hostel: Hostel;
  label: string;
  capacity: number;
  price?: TypeOrNull<number>;
  status: Status;
  beds: Bed[];
}

export interface Bed {
  id: string;
  room: Room;
  label: string;
  status: BedStatus;
  class?: TypeOrNull<Class>;
  amount: number;
  currentAllocation?: TypeOrNull<Allocation>;
}

export interface StayType {
  id: string;
  space: Space;
  name: string;
  startDate: string;
  endDate: string;
}

// ================= Inputs =================
export interface BedInput {
  label: string;
  status?: TypeOrNull<BedStatus>;
  classId?: TypeOrNull<string>;
  amount: number;
}
