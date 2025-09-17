import { db, Prisma } from "../utils/db/db";

export class UserRepository {
  private readonly db = db;

  // ===== Queries =====
  findUserById: Prisma.UserDelegate["findUnique"] = (args) =>
    this.db.user.findUnique(args);

  findUserByEmail: Prisma.UserDelegate["findUnique"] = (args) =>
    this.db.user.findUnique(args);

  findUserByUsername: Prisma.UserDelegate["findUnique"] = (args) =>
    this.db.user.findUnique(args);

  findUsersBySpace: Prisma.UserDelegate["findMany"] = (args) =>
    this.db.user.findMany(args);

  // ===== Mutations =====
  createUser: Prisma.UserDelegate["create"] = (args) =>
    this.db.user.create(args);

  updateUser: Prisma.UserDelegate["update"] = (args) =>
    this.db.user.update(args);
}
