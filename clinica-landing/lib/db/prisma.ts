// lib/db/prisma.ts
// Force rebuild on Vercel
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function makePrismaClient() {
  const url = normalizeDatabaseUrl(
    process.env.DATABASE_URL || process.env.DIRECT_URL
  );

  // ✅ IMPORTANTE: no inicializamos Prisma si no hay DATABASE_URL
  // (así no explota en build/collect)
  if (!url) return undefined;

  const adapter = new PrismaPg({
    connectionString: url,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : [],
  });
}

function normalizeDatabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;

  // If using a pooler URL, add recommended params for stability.
  if (url.includes("-pooler.")) {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "1");
    }
    return parsed.toString();
  }

  return url;
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

export async function resetPrisma(): Promise<void> {
  if (global.__prisma) {
    await global.__prisma.$disconnect();
    global.__prisma = undefined;
  }
}
