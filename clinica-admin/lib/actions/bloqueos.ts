'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '../db/prisma';
import { revalidatePath } from 'next/cache';

export async function crearBloqueo(data: {
    profesionalId: string;
    fecha: Date;
    motivo?: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId;
    if (!clinicId) {
        const firstClinic = await prisma.clinic.findFirst();
        if (!firstClinic) {
            throw new Error('No hay clínicas configuradas');
        }
        clinicId = firstClinic.id;
    }

    // Normalizar fecha a medianoche
    const fechaNormalizada = new Date(data.fecha);
    fechaNormalizada.setHours(0, 0, 0, 0);

    // Verificar si ya existe un bloqueo para ese día
    const existente = await prisma.diaBloqueado.findUnique({
        where: {
            fecha_profesionalId_clinicId: {
                fecha: fechaNormalizada,
                profesionalId: data.profesionalId,
                clinicId,
            },
        },
    });

    if (existente) {
        throw new Error('Ya existe un bloqueo para esta fecha y profesional');
    }

    const bloqueo = await prisma.diaBloqueado.create({
        data: {
            fecha: fechaNormalizada,
            motivo: data.motivo,
            profesionalId: data.profesionalId,
            clinicId,
        },
        include: {
            profesional: true,
        },
    });

    // Cancelar turnos existentes en ese día
    const startOfDay = new Date(fechaNormalizada);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fechaNormalizada);
    endOfDay.setHours(23, 59, 59, 999);

    await prisma.turno.updateMany({
        where: {
            profesionalId: data.profesionalId,
            clinicId,
            fecha: {
                gte: startOfDay,
                lte: endOfDay,
            },
            estado: {
                notIn: ['CANCELADO', 'ASISTIDO'],
            },
        },
        data: {
            estado: 'CANCELADO',
            motivo: data.motivo || 'Día bloqueado por administración',
        },
    });

    revalidatePath('/dashboard/horarios');
    revalidatePath('/dashboard/turnos');
    return bloqueo;
}

export async function eliminarBloqueo(bloqueoId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    await prisma.diaBloqueado.delete({
        where: { id: bloqueoId },
    });

    revalidatePath('/dashboard/horarios');
    revalidatePath('/dashboard/turnos');
}

export async function getBloqueosProfesional(profesionalId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId;
    if (!clinicId) {
        const firstClinic = await prisma.clinic.findFirst();
        if (!firstClinic) {
            return [];
        }
        clinicId = firstClinic.id;
    }

    const bloqueos = await prisma.diaBloqueado.findMany({
        where: {
            profesionalId,
            clinicId,
            fecha: {
                gte: new Date(), // Solo futuros
            },
        },
        include: {
            profesional: true,
        },
        orderBy: {
            fecha: 'asc',
        },
    });

    return bloqueos;
}

export async function getTodosLosBloqueos() {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId;
    if (!clinicId) {
        const firstClinic = await prisma.clinic.findFirst();
        if (!firstClinic) {
            return [];
        }
        clinicId = firstClinic.id;
    }

    const bloqueos = await prisma.diaBloqueado.findMany({
        where: {
            clinicId,
            fecha: {
                gte: new Date(), // Solo futuros
            },
        },
        include: {
            profesional: true,
        },
        orderBy: [
            { fecha: 'asc' },
            { profesional: { nombre: 'asc' } },
        ],
    });

    return bloqueos;
}
