import "dotenv/config";
import { prisma } from "./lib/db/prisma";
import { getDisponibilidadProfesional } from "./lib/queries/turnos";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(label: string, fn: () => Promise<T>, retries = 4): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const code = err?.code || err?.meta?.code;
      const msg = String(err?.message || "");
      const isConn = code === "P1017" || msg.includes("Server has closed the connection");
      if (!isConn || i === retries) break;
      console.log(`[retry ${i}/${retries}] Conexion cerrada, reintentando...`);
      await sleep(1200 * i);
    }
  }
  throw lastError;
}

function addDaysISO(baseISO: string, days: number) {
  const d = new Date(`${baseISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

async function main() {
  const pardo = await withRetry("findPardo", () =>
    prisma.profesional.findFirst({
      where: { nombre: { contains: "Pardo" } },
      select: { id: true, nombre: true, clinicId: true },
    })
  );

  if (!pardo) {
    console.log("No se encontro profesional Pardo en la base.");
    return;
  }

  console.log(`Profesional: ${pardo.nombre} (${pardo.id})`);

  const hoy = new Date();
  const baseISO = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(hoy);

  for (let i = 0; i < 10; i++) {
    const fechaISO = addDaysISO(baseISO, i);
    const slots = await withRetry(`slots-${fechaISO}`, () =>
      getDisponibilidadProfesional({
        clinicId: pardo.clinicId,
        profesionalId: pardo.id,
        dateISO: fechaISO,
      })
    );

    if (slots.length) {
      console.log(`${fechaISO}: ${slots.slice(0, 8).join(", ")}${slots.length > 8 ? ` ... (+${slots.length - 8})` : ""}`);
    } else {
      console.log(`${fechaISO}: sin disponibilidad`);
    }
  }
}

main()
  .catch((err) => {
    console.error("Error verificando disponibilidad:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
