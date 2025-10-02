import type { Gender, User } from "./user";
import type { PublicHostel, Hostel, StayType, Bed } from "./hostel";
import type { Application } from "./application";
import type { Allocation } from "./allocation";
import type { TypeOrNull } from ".";

// ================= Enums =================
export enum SpaceRole {
  Admin = "admin",
  Student = "student",
  Parent = "parent",
}

export enum Status {
  Active = "active",
  Inactive = "inactive",
}

// ================= Entities =================
export interface PublicSpace {
  id: string;
  name: string;
  hostels: PublicHostel[];
}

export interface Space {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  createdById: string;
  createdBy: SimpleUser;
  hostels: Hostel[];
  users: SpaceUser[];
  stayTypes: StayType[];
  classes: Class[];
}

export interface SimpleSpaceInfo {
  id: string;
  name: string;
}

export interface SpaceUser {
  id: string;
  user: User;
  space: SimpleSpaceInfo;
  role: String;
  student?: TypeOrNull<SpaceUser[]>;
  parent?: TypeOrNull<User>;
  class?: TypeOrNull<Class>;
  applications: Application[];
  allocations: Allocation[];
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  space?: Space;
  name: string;
  createdAt: string;
}

export interface SimpleUser {
  id: string
  firstName: string
  lastName: string
  email?: string
}

export interface CreateSpaceUserInput {
    role: String;
    firstName: string;
    lastName: string;
    email?: TypeOrNull<string>;
    password: string;
    phone?: TypeOrNull<string>;
    gender: Gender;
    image?: TypeOrNull<string>;
    classId?: TypeOrNull<string>;
    parentId?: string | null;
    studentId?: (string | null)[] | null;
  }

export interface CreateSpaceInput {
  name: string;
}