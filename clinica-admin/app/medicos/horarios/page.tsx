import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

const DIAS_SEMANA = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];

export default async function MedicosHorariosPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Buscar el profesional asociado a este usuario
    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
        include: {
            profesional: true,
        },
    });

    if (!usuario?.profesional) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p className="mt-2">No tienes un perfil de profesional asociado a tu cuenta.</p>
            </div>
        );
    }

    // Obtener horarios del profesional
    const horarios = await prisma.horario.findMany({
        where: {
            profesionalId: usuario.profesional.id,
        },
        orderBy: {
            diaSemana: 'asc',
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Horarios</h1>
                <p className="text-gray-600 mt-2">
                    Consulta tus horarios de atención configurados
                </p>
            </div>

            {horarios.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No tienes horarios configurados</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {horarios.map((horario) => (
                        <div key={horario.id} className="bg-white rounded-lg shadow p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Día</p>
                                    <p className="font-semibold text-gray-900">
                                        {DIAS_SEMANA[horario.diaSemana]}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Hora Inicio</p>
                                    <p className="font-semibold text-gray-900">
                                        {horario.horaInicio}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Hora Fin</p>
                                    <p className="font-semibold text-gray-900">
                                        {horario.horaFin}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Intervalo</p>
                                    <p className="font-semibold text-gray-900">
                                        {horario.intervaloMin} min
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
