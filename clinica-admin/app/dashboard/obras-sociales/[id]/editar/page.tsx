import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ObraSocialForm from '../../ObraSocialForm';
import { SHARED_CLINIC_ID } from '@/lib/config/clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: { id: string };
}

export default async function EditarObraSocialPage({ params }: PageProps) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    const clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const obraSocial = await prisma.obraSocial.findFirst({
        where: {
            id: params.id,
            clinicId,
        },
    });

    if (!obraSocial) {
        redirect('/dashboard/obras-sociales');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Obra Social</h1>
                <p className="text-gray-600 mt-2">
                    Actualiza la información de {obraSocial.nombre}
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <ObraSocialForm obraSocial={obraSocial} />
            </div>
        </div>
    );
}
