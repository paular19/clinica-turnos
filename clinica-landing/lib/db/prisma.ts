// lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function makePrismaClient() {
  const url = process.env.DATABASE_URL;

  // ✅ IMPORTANTE: no inicializamos Prisma si no hay DATABASE_URL
  // (así no explota en build/collect)
  if (!url) return undefined;

  const adapter = new PrismaPg({ connectionString: url });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn"] : [],
  });
}

/**
 * Usalo como `const prisma = getPrisma();`
 * y recién ahí ejecutás queries.
 */
export function getPrisma(): PrismaClient {
  if (global.__prisma) return global.__prisma;

  const client = makePrismaClient();
  if (!client) {
    throw new Error("DATABASE_URL no está configurada en el entorno.");
  }

  global.__prisma = client;
  return client;
}
