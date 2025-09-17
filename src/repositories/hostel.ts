import { db, Prisma } from "../utils/db/db";

export class HostelRepository {
  private readonly db = db;

  // Hostel methods
  findHostel: Prisma.HostelDelegate["findFirst"] = (args) =>
    this.db.hostel.findFirst(args);

  findHostels: Prisma.HostelDelegate["findMany"] = (args) =>
    this.db.hostel.findMany(args);

  findUniqueHostel: Prisma.HostelDelegate["findUnique"] = (args) =>
    this.db.hostel.findUnique(args);

  countHostels: Prisma.HostelDelegate["count"] = (args) =>
    this.db.hostel.count(args);

  createHostel: Prisma.HostelDelegate["create"] = (args) =>
    this.db.hostel.create(args);

  updateHostel: Prisma.HostelDelegate["update"] = (args) =>
    this.db.hostel.update(args);

  deleteHostel: Prisma.HostelDelegate["delete"] = (args) =>
    this.db.hostel.delete(args);

  // Room methods
  findRoom: Prisma.RoomDelegate["findFirst"] = (args) =>
    this.db.room.findFirst(args);

  findRooms: Prisma.RoomDelegate["findMany"] = (args) =>
    this.db.room.findMany(args);

  findUniqueRoom: Prisma.RoomDelegate["findUnique"] = (args) =>
    this.db.room.findUnique(args);

  countRooms: Prisma.RoomDelegate["count"] = (args) =>
    this.db.room.count(args);

  createRoom: Prisma.RoomDelegate["create"] = (args) =>
    this.db.room.create(args);

  updateRoom: Prisma.RoomDelegate["update"] = (args) =>
    this.db.room.update(args);

  deleteRoom: Prisma.RoomDelegate["delete"] = (args) =>
    this.db.room.delete(args);

  // Bed methods
  findBed: Prisma.BedDelegate["findFirst"] = (args) =>
    this.db.bed.findFirst(args);

  findBeds: Prisma.BedDelegate["findMany"] = (args) =>
    this.db.bed.findMany(args);

  findUniqueBed: Prisma.BedDelegate["findUnique"] = (args) =>
    this.db.bed.findUnique(args);

  countBeds: Prisma.BedDelegate["count"] = (args) =>
    this.db.bed.count(args);

  createBed: Prisma.BedDelegate["create"] = (args) =>
    this.db.bed.create(args);

  updateBed: Prisma.BedDelegate["update"] = (args) =>
    this.db.bed.update(args);

  deleteBed: Prisma.BedDelegate["delete"] = (args) =>
    this.db.bed.delete(args);
}
