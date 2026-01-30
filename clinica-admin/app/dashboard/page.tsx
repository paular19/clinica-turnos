import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { Users, Calendar, Building2, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { TurnoEstado } from '@prisma/client';

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    // Obtener clínica del usuario
    const usuarioDb = await prisma.usuario.findUnique({
        where: { clerkId: user.id },
        include: { clinic: true },
    });

    // Verificar que el usuario sea ADMIN
    if (usuarioDb?.rol === 'MEDICO') {
        redirect('/medicos/turnos');
    }

    if (!usuarioDb?.clinic) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Clínica no configurada</h1>
                <p className="mt-2">Por favor contacta al soporte.</p>
            </div>
        );
    }

    const clinicId = usuarioDb.clinic.id;

    // Obtener datos del dashboard
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const [profesionales, turnosHoy] = await Promise.all([
        prisma.profesional.count({ where: { clinicId } }),
        prisma.turno.findMany({
            where: {
                clinicId,
                fecha: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                paciente: true,
                profesional: true,
                especialidad: true,
            },
            orderBy: { fecha: 'asc' },
            take: 50,
        }),
    ]);

    const obrasSociales = await prisma.obraSocial.count({
        where: { clinicId, activa: true },
    });

    const estadisticas = {
        total: turnosHoy.length,
        confirmados: turnosHoy.filter((t) => t.estado === TurnoEstado.CONFIRMADO).length,
        asistidos: turnosHoy.filter((t) => t.estado === TurnoEstado.ASISTIDO).length,
        retrasados: turnosHoy.filter((t) => t.estado === TurnoEstado.RETRASADO).length,
        ausencias: turnosHoy.filter((t) => t.estado === TurnoEstado.AUSENCIA).length,
        cancelados: turnosHoy.filter((t) => t.estado === TurnoEstado.CANCELADO).length,
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user.firstName}
                </h1>
                <p className="text-gray-600 mt-2">
                    Panel de administración de {usuarioDb.clinic.name}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Profesionales"
                    value={profesionales.toString()}
                    icon={<Users className="text-blue-600" size={24} />}
                    color="blue"
                />
                <StatCard
                    title="Turnos Hoy"
                    value={estadisticas.total.toString()}
                    icon={<Calendar className="text-green-600" size={24} />}
                    color="green"
                />
                <StatCard
                    title="Obras Sociales"
                    value={obrasSociales.toString()}
                    icon={<Building2 className="text-purple-600" size={24} />}
                    color="purple"
                />
                <StatCard
                    title="Asistencias Hoy"
                    value={estadisticas.asistidos.toString()}
                    icon={<CheckCircle className="text-green-600" size={24} />}
                    color="green"
                />
            </div>

            {/* Resumen de asistencias del día */}
            {turnosHoy.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de Asistencias - Hoy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-blue-600">{estadisticas.total}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Asistidos</p>
                            <p className="text-2xl font-bold text-green-600">{estadisticas.asistidos}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Retrasados</p>
                            <p className="text-2xl font-bold text-orange-600">{estadisticas.retrasados}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Ausencias</p>
                            <p className="text-2xl font-bold text-red-600">{estadisticas.ausencias}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Confirmados</p>
                            <p className="text-2xl font-bold text-yellow-600">{estadisticas.confirmados}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de turnos del día */}
            {turnosHoy.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Turnos de Hoy</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: es })}
                        </p>
                    </div>
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
                                    Profesional
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Especialidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {turnosHoy.map((turno) => (
                                <tr key={turno.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        {format(new Date(turno.fecha), "HH:mm")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {turno.paciente.nombre} {turno.paciente.apellido}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            DNI: {turno.paciente.dni}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {turno.profesional.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {turno.especialidad.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${estadoBadgeColor(turno.estado)}`}>
                                            {turno.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Link
                            href="/dashboard/turnos"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            Ver todos los turnos →
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay turnos programados para hoy</p>
                </div>
            )}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickActionButton
                        href="/dashboard/profesionales/nuevo"
                        title="Nuevo Profesional"
                        description="Agregar un nuevo profesional"
                    />
                    <QuickActionButton
                        href="/dashboard/turnos/nuevo"
                        title="Crear Turno"
                        description="Asignar un nuevo turno"
                    />
                    <QuickActionButton
                        href="/dashboard/obras-sociales/nueva"
                        title="Nueva Obra Social"
                        description="Registrar obra social"
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function QuickActionButton({
    href,
    title,
    description
}: {
    href: string;
    title: string;
    description: string;
}) {
    return (
        <a
            href={href}
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </a>
    );
}
