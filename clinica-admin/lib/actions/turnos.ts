'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../db/prisma';
import { sendTurnoNotification } from '../email/sendTurnoNotification';
import { getDisponibilidadProfesional } from '../queries/turnos';

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

export async function createPacienteParaTurno(data: {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono?: string;
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

    const nombre = data.nombre.trim();
    const apellido = data.apellido.trim();
    const dni = data.dni.trim();
    const email = data.email.trim().toLowerCase();
    const telefono = data.telefono?.trim() || undefined;

    if (!nombre || !apellido || !dni || !email) {
        throw new Error('Completá nombre, apellido, DNI y email');
    }

    const existePorDni = await prisma.paciente.findFirst({
        where: {
            clinicId,
            dni,
        },
        select: { id: true },
    });

    if (existePorDni) {
        throw new Error('Ya existe un paciente con ese DNI');
    }

    const existePorEmail = await prisma.paciente.findFirst({
        where: {
            clinicId,
            email,
        },
        select: { id: true },
    });

    if (existePorEmail) {
        throw new Error('Ya existe un paciente con ese email');
    }

    const paciente = await prisma.paciente.create({
        data: {
            nombre,
            apellido,
            dni,
            email,
            telefono,
            clinicId,
        },
        select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
        },
    });

    revalidatePath('/dashboard/turnos/nuevo');
    return paciente;
}

export async function getDisponibilidadParaTurno(data: {
    profesionalId: string;
    fecha: string; // YYYY-MM-DD
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

    if (!data.profesionalId || !data.fecha) {
        return [];
    }

    const slots = await getDisponibilidadProfesional({
        clinicId,
        profesionalId: data.profesionalId,
        dateISO: data.fecha,
    });

    const hoyISO = new Date().toISOString().split('T')[0];
    if (data.fecha !== hoyISO) {
        return slots;
    }

    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    return slots.filter((hhmm) => {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m > minutosAhora;
    });
}

export async function getProximosSlotsParaTurno(data: {
    profesionalId: string;
    dias?: number;
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

    if (!data.profesionalId) return [];

    const totalDias = data.dias && data.dias > 0 ? data.dias : 14;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const hoyISO = hoy.toISOString().split('T')[0];

    const slots: Array<{ fecha: string; dia: string; hora: string }> = [];

    for (let i = 0; i < totalDias; i++) {
        const fechaBase = new Date(hoy);
        fechaBase.setDate(hoy.getDate() + i);
        const fechaISO = fechaBase.toISOString().split('T')[0];

        const horas = await getDisponibilidadProfesional({
            clinicId,
            profesionalId: data.profesionalId,
            dateISO: fechaISO,
        });

        for (const hora of horas) {
            const [h, m] = hora.split(':').map(Number);
            const minutosSlot = h * 60 + m;
            if (fechaISO === hoyISO && minutosSlot <= minutosAhora) {
                continue;
            }

            const fechaSlot = new Date(fechaBase);
            fechaSlot.setHours(h, m, 0, 0);

            const dia = new Intl.DateTimeFormat('es-AR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
            }).format(fechaSlot);

            slots.push({
                fecha: fechaISO,
                dia,
                hora,
            });
        }
    }

    return slots;
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
