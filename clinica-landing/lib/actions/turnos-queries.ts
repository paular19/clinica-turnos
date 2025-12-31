"use server";

import { prisma } from "../db/prisma";
import { listEspecialidadesPublic, listObrasSocialesByEspecialidad, listProfesionalesByEspecialidadYObra } from "../queries/public-turnos";

// Obtener todas las obras sociales disponibles
export async function listObrasSociales() {
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
    // Buscar todas las especialidades donde hay profesionales con esa obra social
    const especialidades = await prisma.especialidad.findMany({
        where: {
            profesionales: {
                some: {
                    obraSociales: {
                        some: {
                            obraSocialId,
                        },
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
    // Buscar profesionales que tengan la especialidad y obra social
    const profesionales = await prisma.profesional.findMany({
        where: {
            especialidades: {
                some: { id: especialidadId }
            },
            obraSociales: {
                some: { obraSocialId }
            },
        },
        select: { id: true, nombre: true, fotoUrl: true },
        orderBy: { nombre: "asc" },
    });

    return profesionales;
}