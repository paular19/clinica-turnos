import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import DeleteProfesionalButton from './DeleteProfesionalButton';
import { SHARED_CLINIC_ID } from '@/lib/config/clinic';

export default async function ProfesionalesPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    // Si no existe usuario, usar el CLINIC_ID compartido
    let clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const profesionales = await prisma.profesional.findMany({
        where: {
            clinicId: clinicId,
        },
        include: {
            especialidades: true,
            obraSociales: {
                include: {
                    obraSocial: true,
                },
            },
            _count: {
                select: {
                    turnos: true,
                    horarios: true,
                },
            },
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    type ProfesionalConRelaciones = (typeof profesionales)[number];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profesionales</h1>
                    <p className="text-gray-600 mt-2">
                        Gestión de profesionales y especialidades
                    </p>
                </div>
                <Link
                    href="/dashboard/profesionales/nuevo"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Profesional
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Matrícula
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Especialidades
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Obras Sociales
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Turnos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Horarios
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {profesionales.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No hay profesionales registrados
                                </td>
                            </tr>
                        ) : (
                            profesionales.map((profesional: ProfesionalConRelaciones) => (
                                <tr key={profesional.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {profesional.nombre}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profesional.matricula || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {profesional.especialidades.map((esp) => (
                                                <span
                                                    key={esp.id}
                                                    className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                                >
                                                    {esp.nombre}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Building2 size={16} />
                                                {profesional.obraSociales.length}
                                            </div>
                                            <Link
                                                href={`/dashboard/profesionales/${profesional.id}/obras-sociales`}
                                                className="text-blue-600 hover:text-blue-900 text-xs underline"
                                            >
                                                Gestionar
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profesional._count.turnos}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profesional._count.horarios}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/dashboard/profesionales/${profesional.id}/editar`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <DeleteProfesionalButton id={profesional.id} />
                                        </div>
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
