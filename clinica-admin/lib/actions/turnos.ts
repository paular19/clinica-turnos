'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../db/prisma';
import { sendTurnoNotification } from '../email/sendTurnoNotification';

export async function getTurnosByProfesional(profesionalId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const turnos = await prisma.turno.findMany({
        where: {
            profesionalId,
        },
        include: {
            paciente: true,
            profesional: true,
            especialidad: true,
        },
        orderBy: {
            fecha: 'desc',
        },
    });

    return turnos;
}

export async function createTurno(data: {
    fecha: Date;
    pacienteId: string;
    profesionalId: string;
    especialidadId: string;
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

    // Generar código único
    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Los turnos creados por admin se crean como CONFIRMADOS directamente
    const turno = await prisma.turno.create({
        data: {
            fecha: data.fecha,
            estado: 'CONFIRMADO',
            motivo: data.motivo,
            codigo,
            pacienteId: data.pacienteId,
            profesionalId: data.profesionalId,
            especialidadId: data.especialidadId,
            clinicId: clinicId,
        },
        include: {
            paciente: true,
            profesional: true,
            especialidad: true,
        },
    });

    revalidatePath('/dashboard/turnos');

    // Enviar notificación de creación al paciente
    if (turno.paciente?.email) {
        try {
            await sendTurnoNotification(
                turno.paciente.email,
                turno,
                turno.paciente,
                'creacion'
            );
        } catch (err) {
            console.error('Error enviando email de creación:', err);
        }
    }

    return turno;
}

export async function cancelarTurno(id: string, motivo?: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const turno = await prisma.turno.update({
        where: { id },
        data: {
            estado: 'CANCELADO',
            motivo: motivo || 'Cancelado por administrador',
        },
        include: {
            paciente: true,
            profesional: true,
            especialidad: true,
        },
    });

    revalidatePath('/dashboard/turnos');

    // Enviar notificación de cancelación al paciente
    if (turno.paciente?.email) {
        try {
            await sendTurnoNotification(
                turno.paciente.email,
                turno,
                turno.paciente,
                'cancelacion',
                turno.motivo || undefined
            );
        } catch (err) {
            console.error('Error enviando email de cancelación:', err);
        }
    }

    return turno;
}

export async function confirmarTurno(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const turno = await prisma.turno.update({
        where: { id },
        data: {
            estado: 'CONFIRMADO',
        },
        include: {
            paciente: true,
            profesional: true,
            especialidad: true,
        },
    });

    revalidatePath('/dashboard/turnos');

    // Enviar notificación de confirmación al paciente
    if (turno.paciente?.email) {
        try {
            await sendTurnoNotification(
                turno.paciente.email,
                turno,
                turno.paciente,
                'creacion'
            );
        } catch (err) {
            console.error('Error enviando email de confirmación:', err);
        }
    }

    return turno;
}

export async function marcarAsistido(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const turno = await prisma.turno.update({
        where: { id },
        data: {
            estado: 'ASISTIDO',
        },
        include: {
            paciente: true,
            profesional: true,
            especialidad: true,
        },
    });

    revalidatePath('/dashboard/turnos');
    return turno;
}
