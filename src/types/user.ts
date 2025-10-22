import type { TypeOrNull } from ".";
import type { Space } from "./space";

// ================= Enums =================
export enum Role {
  User = "user",
  CitAdmin = "cit_admin",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

// ================= Entities =================
export interface User {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email?: TypeOrNull<string>;
  phone?: TypeOrNull<string>;
  gender?: TypeOrNull<Gender>;
  image?: TypeOrNull<string>;
  username: string; // required
  spaces?: Space[]; // [Space!]!
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: TypeOrNull<string>;
}

export interface SimpleUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: TypeOrNull<string>;
}
