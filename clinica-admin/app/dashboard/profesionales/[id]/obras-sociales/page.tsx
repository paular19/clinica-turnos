import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ManageObrasSocialesForm from '../../ManageObrasSocialesForm';
import { SHARED_CLINIC_ID } from '@/lib/config/clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: { id: string };
}

export default async function ProfesionalObrasSocialesPage({ params }: PageProps) {
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
                include: { obraSocial: true },
            },
        },
    });

    if (!profesional) {
        redirect('/dashboard/profesionales');
    }

    const obraSociales = await prisma.obraSocial.findMany({
        where: { clinicId },
        orderBy: { nombre: 'asc' },
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Obras sociales</h1>
                <p className="text-gray-600 mt-2">
                    Configura con qué obras sociales trabaja {profesional.nombre}.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <ManageObrasSocialesForm
                    profesional={profesional}
                    obraSociales={obraSociales}
                />
            </div>
        </div>
    );
}
