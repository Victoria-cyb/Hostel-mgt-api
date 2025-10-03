import { db, Prisma } from "../utils/db/db";

export class SpaceRepository {
  private readonly db = db;

  // ========== SPACES ==========
  createSpace: Prisma.SpaceDelegate["create"] = (args) =>
    this.db.space.create(args);

  findSpaces: Prisma.SpaceDelegate["findMany"] = (args) =>
    this.db.space.findMany(args);

  findSpaceById: Prisma.SpaceDelegate["findUnique"] = (args) =>
    this.db.space.findUnique(args);

  // ========== SPACE USERS ==========
  createSpaceUser: Prisma.SpaceUserDelegate["create"] = (args) =>
    this.db.spaceUser.create(args);

  findSpaceUsers: Prisma.SpaceUserDelegate["findMany"] = (args) =>
    this.db.spaceUser.findMany(args);

   findSpaceUser: Prisma.SpaceUserDelegate["findFirst"] = (args) =>
    this.db.spaceUser.findFirst(args);

   updateSpaceUser: Prisma.SpaceUserDelegate["update"] = (args) =>
    this.db.spaceUser.update(args);

  // ========== CLASSES ==========
  createClass: Prisma.ClassDelegate["create"] = (args) =>
    this.db.class.create(args);

  findClasses: Prisma.ClassDelegate["findMany"] = (args) =>
    this.db.class.findMany(args);

  findClassById: Prisma.ClassDelegate["findUnique"] = (args) =>
    this.db.class.findUnique(args);
}
