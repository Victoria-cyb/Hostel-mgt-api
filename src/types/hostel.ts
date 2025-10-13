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

export type Gender = 'male' | 'female';


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
  // roomCount: number;
  // availableBeds: number;
}

export interface Hostel {
  id: string;
  space?: Space;
  name: string;
  gender: Gender;
 status: Status;
  rooms?: Room[];
  createdAt: string;
}

export interface Room {
  id: string;
  hostel?: Hostel;
  label: string;
  capacity: number;
 status: Status;
  beds: Bed[];
}

export interface Bed {
  id: string;
  room?: Room;
  label: string;
 status: BedStatus;
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
  amount: number;
  hostelId?: string | null
}

export interface HostelInput {
  name: string;
  gender: Gender;
 status?: Status | null;
  rooms?: RoomInput[] | null;
}


export interface RoomInput {
  label: string;
  capacity: number;
 status?: Status | null;
  beds?: BedInput[] | null;
}

export interface UpdateHostelInput {
  name?: string | null;
  gender?: Gender | null;
 status?: Status | null;
}

export interface UpdateRoomInput {
  label?: string | null;
 capacity?: number | null;
  status?: Status | null;
}


export interface UpdateBedInput {
  label?: string | null;
 status?: BedStatus | null;
  amount?: number | null;
}
