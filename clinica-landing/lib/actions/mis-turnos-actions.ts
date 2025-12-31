"use server";

import { prisma } from "../../../lib/db/prisma";
import { revalidatePath } from "next/cache";

/**
 * Busca un turno por su código
 * Usado en: Página Mis Turnos
 */
export async function buscarTurnoPorCodigo(codigo: string) {
    if (!codigo || codigo.trim().length === 0) {
        throw new Error("Código de turno requerido");
    }

    const turno = await prisma.turno.findFirst({
        where: { codigo: codigo.trim() },
        include: {
            paciente: {
                select: {
                    nombre: true,
                    apellido: true,
                    dni: true,
                    email: true,
                },
            },
            profesional: {
                select: {
                    nombre: true,
                },
            },
            especialidad: {
                select: {
                    nombre: true,
                },
            },
        },
    });

    if (!turno) {
        throw new Error("No se encontró ningún turno con ese código");
    }

    // Serializar las fechas a strings para que puedan pasar por la barrera cliente-servidor
    return {
        ...turno,
        fecha: turno.fecha.toISOString(),
        createdAt: turno.createdAt.toISOString(),
    };
}

/**
 * Cancela un turno por su código
 * Verifica que falten al menos 12 horas para el turno
 * Usado en: Página Mis Turnos
 */
export async function cancelarTurno(codigo: string) {
    if (!codigo || codigo.trim().length === 0) {
        throw new Error("Código de turno requerido");
    }

    // Buscar el turno
    const turno = await prisma.turno.findFirst({
        where: { codigo: codigo.trim() },
    });

    if (!turno) {
        throw new Error("No se encontró ningún turno con ese código");
    }

    // Verificar que el turno no esté ya cancelado
    if (turno.estado === "CANCELADO") {
        throw new Error("Este turno ya fue cancelado");
    }

    if (turno.estado === "ASISTIDO") {
        throw new Error("No se puede cancelar un turno que ya fue atendido");
    }

    // Verificar que falten al menos 12 horas para el turno
    const ahora = new Date();
    const fechaTurno = new Date(turno.fecha);
    const horasRestantes = (fechaTurno.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 12) {
        throw new Error("No se puede cancelar el turno. Debe hacerlo con al menos 12 horas de anticipación");
    }

    // Actualizar el turno
    const turnoActualizado = await prisma.turno.update({
        where: { id: turno.id },
        data: {
            estado: "CANCELADO",
        },
    });

    // Revalidar las rutas relevantes
    revalidatePath("/turnos/mis-turnos");

    return turnoActualizado;
}
