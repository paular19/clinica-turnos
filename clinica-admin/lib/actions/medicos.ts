'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../db/prisma';
import { TurnoEstado } from '@prisma/client';

export async function marcarAsistido(turnoId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    // Verificar que el usuario sea el profesional del turno
    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
        include: { profesional: true },
    });

    if (!usuario?.profesional) {
        throw new Error('No tienes permisos para realizar esta acción');
    }

    const turno = await prisma.turno.findUnique({
        where: { id: turnoId },
    });

    if (!turno || turno.profesionalId !== usuario.profesional.id) {
        throw new Error('No tienes permisos para modificar este turno');
    }

    await prisma.turno.update({
        where: { id: turnoId },
        data: {
            estado: TurnoEstado.ASISTIDO,
        },
    });

    revalidatePath('/medicos/turnos');
}

export async function marcarAusencia(turnoId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    // Verificar que el usuario sea el profesional del turno
    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
        include: { profesional: true },
    });

    if (!usuario?.profesional) {
        throw new Error('No tienes permisos para realizar esta acción');
    }

    const turno = await prisma.turno.findUnique({
        where: { id: turnoId },
    });

    if (!turno || turno.profesionalId !== usuario.profesional.id) {
        throw new Error('No tienes permisos para modificar este turno');
    }

    await prisma.turno.update({
        where: { id: turnoId },
        data: {
            estado: TurnoEstado.AUSENCIA,
        },
    });

    revalidatePath('/medicos/turnos');
}
export async function marcarRetrasado(turnoId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    // Verificar que el usuario sea el profesional del turno
    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
        include: { profesional: true },
    });

    if (!usuario?.profesional) {
        throw new Error('No tienes permisos para realizar esta acción');
    }

    const turno = await prisma.turno.findUnique({
        where: { id: turnoId },
    });

    if (!turno || turno.profesionalId !== usuario.profesional.id) {
        throw new Error('No tienes permisos para modificar este turno');
    }

    await prisma.turno.update({
        where: { id: turnoId },
        data: {
            estado: TurnoEstado.RETRASADO,
        },
    });

    revalidatePath('/medicos/turnos');
}
