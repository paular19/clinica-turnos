"use server";

import { getPrisma } from "@/lib/db/prisma";

// Obtener todas las obras sociales disponibles
export async function listObrasSociales() {
  const prisma = getPrisma();

  // Primero intentar obtener todas las obras sociales activas
  let obrasSociales = await prisma.obraSocial.findMany({
    where: { activa: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  // Si no hay obras sociales activas, obtener todas
  if (obrasSociales.length === 0) {
    obrasSociales = await prisma.obraSocial.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });
  }

  return obrasSociales;
}

export async function listEspecialidadesPorObraSocial(obraSocialId: string) {
  const prisma = getPrisma();

  const especialidades = await prisma.especialidad.findMany({
    where: {
      profesionales: {
        some: {
          obraSociales: {
            some: { obraSocialId },
          },
        },
      },
    },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return especialidades;
}

export async function listProfesionalesPorObraSocialYEspecialidad(
  obraSocialId: string,
  especialidadId: string
) {
  const prisma = getPrisma();

  const profesionales = await prisma.profesional.findMany({
    where: {
      especialidades: { some: { id: especialidadId } },
      obraSociales: { some: { obraSocialId } },
    },
    select: { id: true, nombre: true, fotoUrl: true },
    orderBy: { nombre: "asc" },
  });

  return profesionales;
}
