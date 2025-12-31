// lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function makePrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL en el .env");
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn"] : [],
  });
}

export const prisma: PrismaClient = global.__prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
