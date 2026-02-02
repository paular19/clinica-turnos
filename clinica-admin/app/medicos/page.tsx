import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Calendar, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { TurnoEstado } from '@prisma/client';

export default async function MedicosDashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Buscar el profesional asociado a este usuario
    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
        include: {
            profesional: {
                include: {
                    especialidades: true,
                    horarios: true,
                },
            },
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

    const profesional = usuario.profesional;

    // Obtener turnos de hoy y mañana
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const turnosHoy = await prisma.turno.findMany({
        where: {
            profesionalId: profesional.id,
            fecha: {
                gte: startOfDay,
                lte: tomorrow,
            },
        },
    });

    type TurnoSimple = (typeof turnosHoy)[number];

    const estadisticas = {
        total: turnosHoy.length,
        confirmados: turnosHoy.filter((t: TurnoSimple) => t.estado === TurnoEstado.CONFIRMADO).length,
        asistidos: turnosHoy.filter((t: TurnoSimple) => t.estado === TurnoEstado.ASISTIDO).length,
        retrasados: turnosHoy.filter((t: TurnoSimple) => t.estado === TurnoEstado.RETRASADO).length,
        ausencias: turnosHoy.filter((t: TurnoSimple) => t.estado === TurnoEstado.AUSENCIA).length,
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900">
                    Bienvenido, Dr(a). {profesional.nombre}
                </h1>
                <p className="text-gray-600 mt-2">
                    {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
            </div>

            {/* Información del profesional */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Información Profesional</h3>
                        <div className="mt-4 space-y-3">
                            <p className="text-lg font-semibold text-gray-900">
                                {profesional.nombre}
                            </p>
                            {profesional.matricula && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Matrícula:</span> {profesional.matricula}
                                </p>
                            )}
                            {profesional.especialidades.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Especialidades:</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {profesional.especialidades.map((esp: typeof profesional.especialidades[number]) => (
                                            <span
                                                key={esp.id}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                            >
                                                {esp.nombre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase">Resumen de Hoy</h3>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 rounded p-3">
                                <p className="text-xs text-gray-600">Total de Turnos</p>
                                <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
                            </div>
                            <div className="bg-green-50 rounded p-3">
                                <p className="text-xs text-gray-600">Asistidos</p>
                                <p className="text-2xl font-bold text-green-600">{estadisticas.asistidos}</p>
                            </div>
                            <div className="bg-yellow-50 rounded p-3">
                                <p className="text-xs text-gray-600">Confirmados</p>
                                <p className="text-2xl font-bold text-yellow-600">{estadisticas.confirmados}</p>
                            </div>
                            <div className="bg-orange-50 rounded p-3">
                                <p className="text-xs text-gray-600">Retrasados</p>
                                <p className="text-2xl font-bold text-orange-600">{estadisticas.retrasados}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/medicos/turnos"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg hover:border-blue-500 border-2 border-transparent transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Clock className="text-blue-600 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    Mis Turnos
                                </h3>
                                <p className="text-sm text-gray-500">Ver y gestionar turnos de hoy</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/medicos/horarios"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg hover:border-blue-500 border-2 border-transparent transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <Calendar className="text-green-600 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                    Horarios
                                </h3>
                                <p className="text-sm text-gray-500">Ver tus horarios disponibles</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/setup"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg hover:border-blue-500 border-2 border-transparent transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <Settings className="text-purple-600 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                    Configuración
                                </h3>
                                <p className="text-sm text-gray-500">Ajustar tu perfil</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Nota */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 Nota:</span> Los cambios en tus turnos se sincronizarán automáticamente con el dashboard del administrador. Asegúrate de marcar la asistencia o ausencia de tus pacientes.
                </p>
            </div>
        </div>
    );
}
