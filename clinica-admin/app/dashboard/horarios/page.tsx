import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DeleteHorarioButton from './DeleteHorarioButton';

const DIAS_SEMANA = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];

export default async function HorariosPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId;
    if (!clinicId) {
        const firstClinic = await prisma.clinic.findFirst();
        if (!firstClinic) {
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold">No hay clínicas configuradas</h1>
                    <p>Por favor, configura una clínica primero.</p>
                </div>
            );
        }
        clinicId = firstClinic.id;
    }

    const horarios = await prisma.horario.findMany({
        where: {
            clinicId: clinicId,
        },
        include: {
            profesional: {
                include: {
                    especialidades: true,
                },
            },
        },
        orderBy: [
            { profesionalId: 'asc' },
            { diaSemana: 'asc' },
            { horaInicio: 'asc' },
        ],
    });

    type HorarioConProfesional = (typeof horarios)[number];

    type HorariosPorProfesional = Record<
        string,
        { profesional: HorarioConProfesional['profesional']; horarios: HorarioConProfesional[] }
    >;

    // Agrupar por profesional
    const horariosPorProfesional = (horarios as HorarioConProfesional[]).reduce<HorariosPorProfesional>((acc, horario) => {
        const key = horario.profesionalId;
        if (!acc[key]) {
            acc[key] = {
                profesional: horario.profesional,
                horarios: [],
            };
        }
        acc[key].horarios.push(horario);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Horarios Laborales</h1>
                    <p className="text-gray-600 mt-2">
                        Gestiona los horarios de atención de cada profesional
                    </p>
                </div>
                <Link
                    href="/dashboard/horarios/nuevo"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Horario
                </Link>
            </div>

            <div className="space-y-6">
                {Object.keys(horariosPorProfesional).length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        No hay horarios configurados
                    </div>
                ) : (
                    Object.values(horariosPorProfesional).map(({ profesional, horarios }) => (
                        <div key={profesional.id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                                <h2 className="text-xl font-semibold text-white">{profesional.nombre}</h2>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profesional.especialidades.map((esp: any) => (
                                        <span
                                            key={esp.id}
                                            className="text-xs px-2 py-1 bg-white/20 text-white rounded-full"
                                        >
                                            {esp.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {horarios.map((horario) => (
                                        <div
                                            key={horario.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-semibold text-gray-900">
                                                    {DIAS_SEMANA[horario.diaSemana]}
                                                </h3>
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/horarios/${horario.id}/editar`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <DeleteHorarioButton id={horario.id} />
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Horario:</span> {horario.horaInicio} - {horario.horaFin}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Intervalo:</span> {horario.intervaloMin} min
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
