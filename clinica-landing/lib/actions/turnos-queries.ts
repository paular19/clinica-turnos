import "server-only";

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  TURNOS QUERIES - Landing Page (clinica-landing)              ║
 * ╠════════════════════════════════════════════════════════════════╣
 * ║  Este archivo contiene SOLO queries para el flujo público     ║
 * ║  de solicitud de turnos. NO crea turnos en la DB.             ║
 * ║                                                                 ║
 * ║  Para crear turnos: usar crearTurno() desde lib/actions/turnos║
 * ╚════════════════════════════════════════════════════════════════╝
 */

import { prisma } from "../../../lib/db/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function getDefaultClinicId() {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) throw new Error("No clinic found");
    return clinic.id;
}

/**
 * Lista todas las obras sociales activas de la clínica
 * Usado en: Paso 1 del flujo de turnos
 */
export async function listObrasSociales() {
    const clinicId = await getDefaultClinicId();
    return prisma.obraSocial.findMany({ where: { clinicId, activa: true }, orderBy: { nombre: "asc" } });
}

/**
 * Lista especialidades disponibles para una obra social específica
 * Filtra por profesionales que aceptan esa obra social
 * Usado en: Paso 2 del flujo de turnos
 */
export async function listEspecialidadesPorObraSocial(obraSocialId: string) {
    const clinicId = await getDefaultClinicId();
    const profesionales = await prisma.profesional.findMany({
        where: { clinicId, obraSociales: { some: { obraSocialId } } },
        include: { especialidades: true }
    });
    const map = new Map<string, { id: string; nombre: string; descripcion: string | null }>();
    profesionales.forEach((p) => {
        p.especialidades.forEach((e) => {
            if (!map.has(e.id)) map.set(e.id, { id: e.id, nombre: e.nombre, descripcion: e.descripcion });
        });
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Lista profesionales que atienden una obra social y especialidad específicas
 * Usado en: Paso 3 del flujo de turnos
 */
export async function listProfesionalesPorObraSocialYEspecialidad(obraSocialId: string, especialidadId: string) {
    const clinicId = await getDefaultClinicId();
    return prisma.profesional.findMany({
        where: {
            clinicId,
            obraSociales: { some: { obraSocialId } },
            especialidades: { some: { id: especialidadId } }
        },
        include: { horarios: true }
    });
}
