import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import DeleteObraSocialButton from './DeleteObraSocialButton';

const SHARED_CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ObrasSocialesPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const obrasSociales = await prisma.obraSocial.findMany({
        where: {
            clinicId: clinicId,
        },
        include: {
            _count: {
                select: {
                    pacientes: true,
                    profesionales: true,
                },
            },
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Obras Sociales</h1>
                    <p className="text-gray-600 mt-2">
                        Gestión de obras sociales y cobertura médica
                    </p>
                </div>
                <Link
                    href="/dashboard/obras-sociales/nueva"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nueva Obra Social
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {obrasSociales.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        No hay obras sociales registradas
                    </div>
                ) : (
                    obrasSociales.map((obraSocial) => (
                        <div
                            key={obraSocial.id}
                            className="bg-white rounded-lg shadow p-6 space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {obraSocial.nombre}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        {obraSocial.activa ? (
                                            <>
                                                <CheckCircle size={16} className="text-green-500" />
                                                <span className="text-sm text-green-600">Activa</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={16} className="text-red-500" />
                                                <span className="text-sm text-red-600">Inactiva</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/obras-sociales/${obraSocial.id}/editar`}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                    <DeleteObraSocialButton id={obraSocial.id} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Pacientes:</span>
                                    <span className="font-medium text-gray-900">
                                        {obraSocial._count.pacientes}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Profesionales:</span>
                                    <span className="font-medium text-gray-900">
                                        {obraSocial._count.profesionales}
                                    </span>
                                </div>
                            </div>

                            <Link
                                href={`/dashboard/obras-sociales/${obraSocial.id}/profesionales`}
                                className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Gestionar Profesionales
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
