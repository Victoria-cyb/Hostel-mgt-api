import { db, Prisma } from "../utils/db/db";

export class PaymentRepository {
  private readonly db = db;

  findPayment: Prisma.PaymentDelegate["findFirst"] = (args) =>
    this.db.payment.findFirst(args);

  findPayments: Prisma.PaymentDelegate["findMany"] = (args) =>
    this.db.payment.findMany(args);

  findUniquePayment: Prisma.PaymentDelegate["findUnique"] = (args) =>
    this.db.payment.findUnique(args);

  countPayments: Prisma.PaymentDelegate["count"] = (args) =>
    this.db.payment.count(args);

  createPayment: Prisma.PaymentDelegate["create"] = (args) =>
    this.db.payment.create(args);

  updatePayment: Prisma.PaymentDelegate["update"] = (args) =>
    this.db.payment.update(args);

  deletePayment: Prisma.PaymentDelegate["delete"] = (args) =>
    this.db.payment.delete(args);
}
