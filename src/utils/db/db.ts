import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient({
  log: ["error", "warn"],
});

export * from "@prisma/client";
