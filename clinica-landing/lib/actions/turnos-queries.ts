"use server";

import { getPrisma, resetPrisma } from "@/lib/db/prisma";

// ✅ ClinicId donde cargaste el seed en Neon
const CLINIC_ID_PUBLIC = "406fc3e2-342a-4871-b52a-d63f95be4072";

// Obtener todas las obras sociales disponibles (para el módulo público)
export async function listObrasSociales() {
  return withPrismaRetry(async (prisma) => {
    // Primero intentar obtener todas las obras sociales activas de la clínica pública
    let obrasSociales = await prisma.obraSocial.findMany({
      where: { activa: true, clinicId: CLINIC_ID_PUBLIC },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    // Si no hay obras sociales activas, obtener todas (igual filtradas por clínica)
    if (obrasSociales.length === 0) {
      obrasSociales = await prisma.obraSocial.findMany({
        where: { clinicId: CLINIC_ID_PUBLIC },
        select: { id: true, nombre: true },
        orderBy: { nombre: "asc" },
      });
    }

    return obrasSociales;
  });
}

export async function listEspecialidadesPorObraSocial(obraSocialId: string) {
  return withPrismaRetry(async (prisma) => {
    const especialidades = await prisma.especialidad.findMany({
      where: {
        clinicId: CLINIC_ID_PUBLIC,
        profesionales: {
          some: {
            clinicId: CLINIC_ID_PUBLIC,
            obraSociales: {
              some: {
                obraSocialId,
                clinicId: CLINIC_ID_PUBLIC,
              },
            },
          },
        },
      },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    return especialidades;
  });
}

export async function listProfesionalesPorObraSocialYEspecialidad(
  obraSocialId: string,
  especialidadId: string
) {
  return withPrismaRetry(async (prisma) => {
    const profesionales = await prisma.profesional.findMany({
      where: {
        clinicId: CLINIC_ID_PUBLIC,
        especialidades: { some: { id: especialidadId } },
        obraSociales: {
          some: {
            obraSocialId,
            clinicId: CLINIC_ID_PUBLIC,
          },
        },
      },
      select: { id: true, nombre: true, fotoUrl: true },
      orderBy: { nombre: "asc" },
    });

    return profesionales;
  });
}

async function withPrismaRetry<T>(
  handler: (prisma: ReturnType<typeof getPrisma>) => Promise<T>
): Promise<T> {
  try {
    const prisma = getPrisma();
    return await handler(prisma);
  } catch (error) {
    if (isConnectionClosedError(error)) {
      await resetPrisma();
      const prisma = getPrisma();
      return await handler(prisma);
    }
    throw error;
  }
}

function isConnectionClosedError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Server has closed the connection");
}
