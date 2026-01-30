import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ProfesionalForm from '../../ProfesionalForm';
import { SHARED_CLINIC_ID } from '@/lib/config/clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: { id: string };
}

export default async function EditarProfesionalPage({ params }: PageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    const clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const profesional = await prisma.profesional.findFirst({
        where: {
            id: params.id,
            clinicId,
        },
        include: {
            especialidades: true,
            obraSociales: {
                include: {
                    obraSocial: true,
                },
            },
        },
    });

    if (!profesional) {
        redirect('/dashboard/profesionales');
    }

    const especialidades = await prisma.especialidad.findMany({
        where: {
            clinicId,
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    const obraSociales = await prisma.obraSocial.findMany({
        where: {
            clinicId,
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Profesional</h1>
                <p className="text-gray-600 mt-2">
                    Actualiza la información de {profesional.nombre}
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <ProfesionalForm
                    especialidades={especialidades}
                    obraSociales={obraSociales}
                    profesional={profesional}
                />
            </div>
        </div>
    );
}
