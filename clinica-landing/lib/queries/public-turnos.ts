import { getPrisma } from "@/lib/db/prisma";
const prisma = getPrisma();


export async function listEspecialidadesPublic(clinicId: string) {
  return prisma.especialidad.findMany({
    where: { clinicId },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  });
}

export async function listObrasSocialesByEspecialidad(params: {
  clinicId: string;
  especialidadId: string;
}) {
  const { clinicId, especialidadId } = params;

  const rels = await prisma.profesionalObraSocial.findMany({
    where: {
      clinicId,
      profesional: {
        clinicId,
        especialidades: { some: { id: especialidadId } },
      },
      obraSocial: { clinicId, activa: true },
    },
    select: { obraSocial: { select: { id: true, nombre: true } } },
  });

  const map = new Map<string, { id: string; nombre: string }>();
  for (const r of rels) map.set(r.obraSocial.id, r.obraSocial);

  return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function listProfesionalesByEspecialidadYObra(params: {
  clinicId: string;
  especialidadId: string;
  obraSocialId: string;
}) {
  const { clinicId, especialidadId, obraSocialId } = params;

  return prisma.profesional.findMany({
    where: {
      clinicId,
      especialidades: { some: { id: especialidadId } },
      obraSociales: { some: { clinicId, obraSocialId } },
    },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, fotoUrl: true },
  });
}
