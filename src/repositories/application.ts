import { db, Prisma } from "../utils/db/db";

export class ApplicationRepository {
  private readonly db = db;

  findApplication: Prisma.ApplicationDelegate["findFirst"] = (args) =>
    this.db.application.findFirst(args);

  findApplications: Prisma.ApplicationDelegate["findMany"] = (args) =>
    this.db.application.findMany(args);

  findUniqueApplication: Prisma.ApplicationDelegate["findUnique"] = (args) =>
    this.db.application.findUnique(args);

  countApplications: Prisma.ApplicationDelegate["count"] = (args) =>
    this.db.application.count(args);

  createApplication: Prisma.ApplicationDelegate["create"] = (args) =>
    this.db.application.create(args);

  updateApplication: Prisma.ApplicationDelegate["update"] = (args) =>
    this.db.application.update(args);

  deleteApplication: Prisma.ApplicationDelegate["delete"] = (args) =>
    this.db.application.delete(args);
}
