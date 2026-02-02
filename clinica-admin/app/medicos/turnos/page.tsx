import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import TurnoMedicoActions from './TurnoMedicoActions';

export default async function MedicosTurnosPage() {
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

    // Obtener turnos de hoy y mañana
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const turnos = await prisma.turno.findMany({
        where: {
            profesionalId: usuario.profesional.id,
            fecha: {
                gte: startOfDay,
                lte: tomorrow,
            },
        },
        include: {
            paciente: {
                select: {
                    nombre: true,
                    apellido: true,
                    dni: true,
                    email: true,
                    telefono: true,
                    obraSocial: {
                        select: { nombre: true },
                    },
                },
            },
            especialidad: true,
        },
        orderBy: {
            fecha: 'asc',
        },
    });

    type TurnoConRelaciones = (typeof turnos)[number];

    // Calcular estadísticas
    const estadisticas = {
        total: turnos.length,
        confirmados: turnos.filter((t: TurnoConRelaciones) => t.estado === 'CONFIRMADO').length,
        asistidos: turnos.filter((t: TurnoConRelaciones) => t.estado === 'ASISTIDO').length,
        retrasados: turnos.filter((t: TurnoConRelaciones) => t.estado === 'RETRASADO').length,
        ausencias: turnos.filter((t: TurnoConRelaciones) => t.estado === 'AUSENCIA').length,
        cancelados: turnos.filter((t: TurnoConRelaciones) => t.estado === 'CANCELADO').length,
        pendientes: turnos.filter((t: TurnoConRelaciones) => t.estado === 'PENDIENTE').length,
    };

    const estadoBadgeColor = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMADO':
                return 'bg-blue-100 text-blue-800';
            case 'ASISTIDO':
                return 'bg-green-100 text-green-800';
            case 'RETRASADO':
                return 'bg-orange-100 text-orange-800';
            case 'AUSENCIA':
                return 'bg-red-100 text-red-800';
            case 'CANCELADO':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Turnos (Hoy y Mañana)</h1>
                <p className="text-gray-600 mt-2">
                    {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Turnos</p>
                            <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                        </div>
                        <Clock className="text-blue-500 w-8 h-8 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Asistidos</p>
                            <p className="text-2xl font-bold text-green-600">{estadisticas.asistidos}</p>
                        </div>
                        <CheckCircle className="text-green-500 w-8 h-8 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Retrasados</p>
                            <p className="text-2xl font-bold text-orange-600">{estadisticas.retrasados}</p>
                        </div>
                        <AlertCircle className="text-orange-500 w-8 h-8 opacity-20" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Ausencias</p>
                            <p className="text-2xl font-bold text-red-600">{estadisticas.ausencias}</p>
                        </div>
                        <XCircle className="text-red-500 w-8 h-8 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Tabla de turnos */}
            {turnos.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-lg">No tienes turnos programados para hoy</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hora
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Paciente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Especialidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {turnos.map((turno: TurnoConRelaciones) => (
                                <tr key={turno.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {format(new Date(turno.fecha), "HH:mm", { locale: es })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {turno.paciente.nombre} {turno.paciente.apellido}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            DNI: {turno.paciente.dni}
                                        </div>
                                        {turno.paciente.obraSocial && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                {turno.paciente.obraSocial.nombre}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        <div className="text-sm">{turno.paciente.telefono || '-'}</div>
                                        <div className="text-xs text-gray-400">{turno.paciente.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {turno.especialidad.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${estadoBadgeColor(turno.estado)}`}>
                                            {turno.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <TurnoMedicoActions turnoId={turno.id} estado={turno.estado} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
