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
  role: SpaceRole;
  parent?: TypeOrNull<User>;
  class?: TypeOrNull<Class>;
  applications: Application[];
  allocations: Allocation[];
  createdAt: string;
}

export interface Class {
  id: string;
  space: Space;
  name: string;
  createdAt: string;
}

export interface CreateSpaceUserInput {
    role: SpaceRole;
    name?: TypeOrNull<string>;
    firstName?: TypeOrNull<string>;
    lastName?: TypeOrNull<string>;
    email?: TypeOrNull<string>;
    password: string;
    phone?: TypeOrNull<string>;
    gender?: TypeOrNull<Gender>;
    image?: TypeOrNull<string>;
    classId?: TypeOrNull<string>;
    parentId?: TypeOrNull<string>;
  }

export interface CreateSpaceInput {
  name: string;
}