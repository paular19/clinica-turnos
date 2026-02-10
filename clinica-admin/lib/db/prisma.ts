import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = normalizeDatabaseUrl(
  process.env.DIRECT_URL || process.env.DATABASE_URL
);
if (!connectionString) {
  throw new Error("Falta DATABASE_URL o DIRECT_URL en el runtime (revisa .env.local y reinicia next dev).");
}

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function normalizeDatabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;

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
