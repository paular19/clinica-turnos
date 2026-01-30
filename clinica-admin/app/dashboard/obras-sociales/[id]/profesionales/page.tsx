import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VincularProfesionalButton from './VincularProfesionalButton';
import { SHARED_CLINIC_ID } from '@/lib/config/clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ObraSocialProfesionalesPage({
    params,
}: {
    params: { id: string };
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const { id } = params;

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    const clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const obraSocial = await prisma.obraSocial.findUnique({
        where: { id, clinicId },
        include: {
            profesionales: {
                include: {
                    profesional: {
                        include: {
                            especialidades: true,
                        },
                    },
                },
            },
        },
    });

    if (!obraSocial) {
        redirect('/dashboard/obras-sociales');
    }

    const todosLosProfesionales = await prisma.profesional.findMany({
        where: {
            clinicId,
        },
        include: {
            especialidades: true,
        },
    });

    type ProfesionalConEspecialidades = (typeof todosLosProfesionales)[number];
    type VinculoProfesional = (typeof obraSocial.profesionales)[number];

    const profesionalesVinculados = obraSocial.profesionales.map((p: VinculoProfesional) => p.profesional);
    const profesionalesDisponibles = todosLosProfesionales.filter(
        (p: ProfesionalConEspecialidades) => !profesionalesVinculados.find((pv: ProfesionalConEspecialidades) => pv.id === p.id)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/obras-sociales"
                    className="text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{obraSocial.nombre}</h1>
                    <p className="text-gray-600 mt-2">
                        Gestiona los profesionales vinculados a esta obra social
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profesionales Vinculados */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Profesionales Vinculados</h2>
                    {profesionalesVinculados.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No hay profesionales vinculados
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {profesionalesVinculados.map((profesional) => (
                                <div
                                    key={profesional.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{profesional.nombre}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {profesional.especialidades.map((esp) => (
                                                <span
                                                    key={esp.id}
                                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                                                >
                                                    {esp.nombre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <VincularProfesionalButton
                                        obraSocialId={obraSocial.id}
                                        profesionalId={profesional.id}
                                        isVinculado={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profesionales Disponibles */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Profesionales Disponibles</h2>
                    {profesionalesDisponibles.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No hay profesionales disponibles para vincular
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {profesionalesDisponibles.map((profesional) => (
                                <div
                                    key={profesional.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{profesional.nombre}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {profesional.especialidades.map((esp) => (
                                                <span
                                                    key={esp.id}
                                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                                                >
                                                    {esp.nombre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <VincularProfesionalButton
                                        obraSocialId={obraSocial.id}
                                        profesionalId={profesional.id}
                                        isVinculado={false}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
