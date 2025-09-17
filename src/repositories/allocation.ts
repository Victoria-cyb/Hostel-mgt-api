import { db, Prisma } from "../utils/db/db";

export class AllocationRepository {
  private readonly db = db;

  findAllocation: Prisma.AllocationDelegate["findFirst"] = (args) =>
    this.db.allocation.findFirst(args);

  findAllocations: Prisma.AllocationDelegate["findMany"] = (args) =>
    this.db.allocation.findMany(args);

  findUniqueAllocation: Prisma.AllocationDelegate["findUnique"] = (args) =>
    this.db.allocation.findUnique(args);

  countAllocations: Prisma.AllocationDelegate["count"] = (args) =>
    this.db.allocation.count(args);

  createAllocation: Prisma.AllocationDelegate["create"] = (args) =>
    this.db.allocation.create(args);

  updateAllocation: Prisma.AllocationDelegate["update"] = (args) =>
    this.db.allocation.update(args);

  deleteAllocation: Prisma.AllocationDelegate["delete"] = (args) =>
    this.db.allocation.delete(args);
}
