import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import TurnoActions from './TurnoActions';
import TurnosFiltros from './TurnosFiltros';

const SHARED_CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";
const CLINIC_TIMEZONE = 'America/Argentina/Buenos_Aires';

export default async function TurnosPage({
    searchParams,
}: {
    searchParams: Promise<{ profesional?: string; estado?: string }>;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const params = await searchParams;

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const profesionales = await prisma.profesional.findMany({
        where: {
            clinicId: clinicId,
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    // Construir filtros
    const where: any = {
        clinicId: clinicId,
    };

    if (params.profesional) {
        where.profesionalId = params.profesional;
    }

    if (params.estado) {
        where.estado = params.estado;
    }

    const turnos = await prisma.turno.findMany({
        where,
        include: {
            paciente: true,
            profesional: true,
            especialidad: true,
        },
        orderBy: {
            fecha: 'desc',
        },
        take: 100,
    });

    type TurnoConRelaciones = (typeof turnos)[number];

    const estadoBadgeColor = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMADO':
                return 'bg-blue-100 text-blue-800';
            case 'ASISTIDO':
                return 'bg-green-100 text-green-800';
            case 'CANCELADO':
                return 'bg-red-100 text-red-800';
            case 'REPROGRAMADO':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
                    <p className="text-gray-600 mt-2">
                        Visualiza y administra todos los turnos
                    </p>
                </div>
                <Link
                    href="/dashboard/turnos/nuevo"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Turno
                </Link>
            </div>

            {/* Filtros */}
            <TurnosFiltros profesionales={profesionales} />

            {/* Lista de turnos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha y Hora
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {turnos.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No hay turnos para mostrar
                                </td>
                            </tr>
                        ) : (
                            turnos.map((turno: TurnoConRelaciones) => (
                                <tr key={turno.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar size={16} className="text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {new Intl.DateTimeFormat('es-AR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        timeZone: CLINIC_TIMEZONE,
                                                    }).format(new Date(turno.fecha))}
                                                </div>
                                                <div className="text-gray-500">
                                                    {new Intl.DateTimeFormat('es-AR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false,
                                                        timeZone: CLINIC_TIMEZONE,
                                                    }).format(new Date(turno.fecha))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {turno.paciente.nombre} {turno.paciente.apellido}
                                            </div>
                                            <div className="text-gray-500">{turno.paciente.dni}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {turno.profesional.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {turno.especialidad.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${estadoBadgeColor(
                                                turno.estado
                                            )}`}
                                        >
                                            {turno.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        {turno.codigo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <TurnoActions turno={turno} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
