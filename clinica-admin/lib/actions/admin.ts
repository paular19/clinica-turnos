'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../db/prisma';
import { Prisma } from '@prisma/client';

// PROFESIONALES

export async function getProfesionales() {
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

    return prisma.profesional.findMany({
        where: { clinicId },
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
    });
}

export async function createProfesional(data: {
    nombre: string;
    matricula?: string;
    especialidadIds: string[];
    obraSocialIds?: string[];
}) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    // Obtener usuario y clinic
    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    // Si no existe usuario, usar la primera clínica disponible
    let clinicId = usuario?.clinicId;
    if (!clinicId) {
        const firstClinic = await prisma.clinic.findFirst();
        if (!firstClinic) {
            throw new Error('No hay clínicas configuradas');
        }
        clinicId = firstClinic.id;
    }

    const profesional = await prisma.profesional.create({
        data: {
            nombre: data.nombre,
            matricula: data.matricula,
            clinicId: clinicId,
            especialidades: {
                connect: data.especialidadIds.map(id => ({ id })),
            },
        },
        include: {
            especialidades: true,
        },
    });

    if (data.obraSocialIds && data.obraSocialIds.length > 0) {
        await prisma.profesionalObraSocial.createMany({
            data: data.obraSocialIds.map(obraSocialId => ({
                profesionalId: profesional.id,
                obraSocialId,
                clinicId,
            })),
            skipDuplicates: true,
        });
    }

    revalidatePath('/dashboard/profesionales');
    return profesional;
}

export async function updateProfesional(
    id: string,
    data: {
        nombre: string;
        matricula?: string;
        especialidadIds: string[];
        obraSocialIds?: string[];
    }
) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const profesional = await prisma.profesional.update({
        where: { id },
        data: {
            nombre: data.nombre,
            matricula: data.matricula,
            especialidades: {
                set: data.especialidadIds.map(id => ({ id })),
            },
        },
        include: {
            especialidades: true,
        },
    });

    if (data.obraSocialIds) {
        await prisma.profesionalObraSocial.deleteMany({
            where: { profesionalId: id },
        });

        if (data.obraSocialIds.length > 0) {
            await prisma.profesionalObraSocial.createMany({
                data: data.obraSocialIds.map(obraSocialId => ({
                    profesionalId: id,
                    obraSocialId,
                    clinicId: profesional.clinicId,
                })),
                skipDuplicates: true,
            });
        }
    }

    revalidatePath('/dashboard/profesionales');
    return profesional;
}

export async function deleteProfesional(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Eliminar TODOS los turnos (no solo actualizar)
            await tx.turno.deleteMany({
                where: { profesionalId: id },
            });

            // 2. Eliminar horarios
            await tx.horario.deleteMany({
                where: { profesionalId: id },
            });

            // 3. Eliminar relaciones con obras sociales
            await tx.profesionalObraSocial.deleteMany({
                where: { profesionalId: id },
            });

            // 4. Desvincular de especialidades (relación many-to-many)
            await tx.profesional.update({
                where: { id },
                data: {
                    especialidades: {
                        set: [], // Desvincula todas las especialidades
                    },
                },
            });

            // 5. Finalmente eliminar el profesional
            await tx.profesional.delete({
                where: { id },
            });
        });

        revalidatePath('/dashboard/profesionales');
    } catch (error: any) {
        console.error('Error al eliminar profesional:', error);
        throw new Error(error.message || 'No se pudo eliminar el profesional');
    }
}

// OBRAS SOCIALES

export async function createObraSocial(data: {
    nombre: string;
    activa: boolean;
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

    const obraSocial = await prisma.obraSocial.create({
        data: {
            nombre: data.nombre,
            activa: data.activa,
            clinicId: clinicId,
        },
    });

    revalidatePath('/dashboard/obras-sociales');
    return obraSocial;
}

export async function updateObraSocial(
    id: string,
    data: {
        nombre: string;
        activa: boolean;
    }
) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const obraSocial = await prisma.obraSocial.update({
        where: { id },
        data: {
            nombre: data.nombre,
            activa: data.activa,
        },
    });

    revalidatePath('/dashboard/obras-sociales');
    return obraSocial;
}

export async function deleteObraSocial(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    await prisma.$transaction(async (tx) => {
        await tx.profesionalObraSocial.deleteMany({
            where: { obraSocialId: id },
        });

        await tx.paciente.updateMany({
            where: { obraSocialId: id },
            data: { obraSocialId: null },
        });

        await tx.obraSocial.delete({
            where: { id },
        });
    });

    revalidatePath('/dashboard/obras-sociales');
}

// VINCULAR OBRA SOCIAL A PROFESIONAL

export async function vincularObraSocial(
    profesionalId: string,
    obraSocialId: string
) {
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

    await prisma.profesionalObraSocial.create({
        data: {
            profesionalId,
            obraSocialId,
            clinicId: clinicId,
        },
    });

    revalidatePath('/dashboard/profesionales');
}

export async function desvincularObraSocial(
    profesionalId: string,
    obraSocialId: string
) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    await prisma.profesionalObraSocial.delete({
        where: {
            profesionalId_obraSocialId: {
                profesionalId,
                obraSocialId,
            },
        },
    });

    revalidatePath('/dashboard/profesionales');
}

// HORARIOS

function normalizeDiaSemana(diaSemana: number) {
    if (diaSemana === 0) return 7;
    return diaSemana;
}

export async function createHorario(data: {
    profesionalId: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    intervaloMin: number;
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

    const diaSemana = normalizeDiaSemana(data.diaSemana);
    if (!Number.isInteger(diaSemana) || diaSemana < 1 || diaSemana > 7) {
        throw new Error('Día de semana inválido. Debe estar entre 1 (Lunes) y 7 (Domingo).');
    }

    const horario = await prisma.horario.create({
        data: {
            profesionalId: data.profesionalId,
            diaSemana,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            intervaloMin: data.intervaloMin,
            clinicId: clinicId,
        },
    });

    revalidatePath('/dashboard/horarios');
    return horario;
}

export async function updateHorario(
    id: string,
    data: {
        diaSemana: number;
        horaInicio: string;
        horaFin: string;
        intervaloMin: number;
    }
) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const diaSemana = normalizeDiaSemana(data.diaSemana);
    if (!Number.isInteger(diaSemana) || diaSemana < 1 || diaSemana > 7) {
        throw new Error('Día de semana inválido. Debe estar entre 1 (Lunes) y 7 (Domingo).');
    }

    const horario = await prisma.horario.update({
        where: { id },
        data: {
            diaSemana,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            intervaloMin: data.intervaloMin,
        },
    });

    revalidatePath('/dashboard/horarios');
    return horario;
}

export async function deleteHorario(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    await prisma.horario.delete({
        where: { id },
    });

    revalidatePath('/dashboard/horarios');
}

// CARGAR HORARIOS Y GENERAR TURNOS

const SHARED_CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";
const DIAS_ANTICIPACION = 30;

const horariosData = [
    { nombre: 'Albornoz Juan José', dias: [1, 2, 4], inicio: '11:00', fin: '20:00' },
    { nombre: 'Coronel Jorge', dias: [1, 2, 3], inicio: '18:00', fin: '19:00' },
    { nombre: 'Brem Rubén', dias: [2, 4, 5], inicio: '18:30', fin: '20:00' },
    { nombre: 'Brunetto Guadalupe', dias: [2, 4], inicio: '13:30', fin: '15:00' },
    { nombre: 'Iglesias Carlos', dias: [4], inicio: '18:00', fin: '19:00' },
    { nombre: 'Gil Laura', dias: [5], inicio: '14:30', fin: '15:30' },
    { nombre: 'Gutiérrez Gabriel', dias: [1, 2, 3, 5], inicio: '18:30', fin: '20:00' },
    { nombre: 'Mondaque Vanesa', dias: [2], inicio: '16:30', fin: '18:00' },
    { nombre: 'Navarrete Ivana', dias: [2, 3, 4, 5], inicio: '09:30', fin: '11:00' },
    { nombre: 'Ocampo Julio', dias: [3, 5], inicio: '08:30', fin: '10:30' },
    { nombre: 'Pardo Alejandro', dias: [2, 3], inicio: '10:30', fin: '12:00' },
    { nombre: 'Rocha Ivana', dias: [1, 2, 3, 4, 5], inicio: '13:30', fin: '15:00' },
    { nombre: 'Salvatierra María', dias: [1, 2, 3, 5], inicio: '10:30', fin: '12:00' },
];

function horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

function minutosAHora(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export async function cargarHorariosYGenerarTurnos() {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    let totalHorarios = 0;
    let totalTurnos = 0;
    const horariosMap = new Map();

    // Paso 1: Cargar horarios
    for (const horario of horariosData) {
        const prof = await prisma.profesional.findFirst({
            where: {
                clinicId: SHARED_CLINIC_ID,
                nombre: { contains: horario.nombre.split(' ')[0] },
            },
        });

        if (!prof) {
            console.log(`⚠️  No se encontró: ${horario.nombre}`);
            continue;
        }

        // Crear un horario por cada día
        for (const dia of horario.dias) {
            await prisma.horario.create({
                data: {
                    diaSemana: dia,
                    horaInicio: horario.inicio,
                    horaFin: horario.fin,
                    intervaloMin: 45,
                    profesionalId: prof.id,
                    clinicId: SHARED_CLINIC_ID,
                },
            });
            totalHorarios++;

            // Guardar en mapa para generar turnos
            if (!horariosMap.has(prof.id)) {
                horariosMap.set(prof.id, []);
            }
            horariosMap.get(prof.id).push({
                diaSemana: dia,
                horaInicio: horario.inicio,
                horaFin: horario.fin,
            });
        }
    }

    // Paso 2: Generar turnos automáticamente
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let d = 0; d < DIAS_ANTICIPACION; d++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() + d);
        const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();

        // Para cada profesional
        for (const [profesionalId, diasHorarios] of horariosMap) {
            const horariosDelDia = (diasHorarios as any[]).filter((h: any) => h.diaSemana === diaSemana);

            for (const h of horariosDelDia) {
                const inicio = horaAMinutos(h.horaInicio);
                const fin = horaAMinutos(h.horaFin);

                // Generar turnos cada 45 minutos (30 min turno + 15 min intervalo)
                for (let minuto = inicio; minuto < fin; minuto += 45) {
                    const horaString = minutosAHora(minuto);
                    const [hh, mm] = horaString.split(':');

                    const fechaTurno = new Date(fecha);
                    fechaTurno.setHours(parseInt(hh), parseInt(mm), 0, 0);

                    // Verificar que no exista
                    const existe = await prisma.turno.findFirst({
                        where: {
                            profesionalId,
                            fecha: fechaTurno,
                        },
                    });

                    if (!existe) {
                        const prof = await prisma.profesional.findUnique({
                            where: { id: profesionalId },
                            select: { especialidades: { select: { id: true } } },
                        });

                        await prisma.turno.create({
                            data: {
                                fecha: fechaTurno,
                                estado: 'PENDIENTE',
                                codigo: Math.random().toString(36).substring(2, 10).toUpperCase(),
                                pacienteId: '',
                                profesionalId,
                                especialidadId: prof?.especialidades[0]?.id || '',
                                clinicId: SHARED_CLINIC_ID,
                            },
                        });
                        totalTurnos++;
                    }
                }
            }
        }
    }

    revalidatePath('/dashboard/turnos');
    revalidatePath('/dashboard/horarios');

    return {
        totalHorarios,
        totalTurnos,
        message: `✅ Se cargaron ${totalHorarios} horarios y se generaron ${totalTurnos} turnos disponibles para los próximos ${DIAS_ANTICIPACION} días`,
    };
}
