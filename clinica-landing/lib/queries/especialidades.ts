import { prisma } from "../db/prisma";

export async function listEspecialidades(clinicId: string) {
  return prisma.especialidad.findMany({
    where: { clinicId },
    orderBy: { nombre: "asc" },
  });
}

export async function getEspecialidadById(id: string, clinicId: string) {
  return prisma.especialidad.findFirst({ where: { id, clinicId } });
}
