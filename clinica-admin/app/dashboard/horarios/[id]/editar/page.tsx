import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import HorarioForm from '../../HorarioForm';
import { SHARED_CLINIC_ID } from '@/lib/config/clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarHorarioPage({ params }: PageProps) {
    const { id } = await params;

    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    const clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const horario = await prisma.horario.findUnique({
        where: { id },
        include: {
            profesional: {
                include: {
                    especialidades: true,
                },
            },
        },
    });

    if (!horario || horario.clinicId !== clinicId) {
        redirect('/dashboard/horarios');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Editar Horario</h1>
                <p className="text-gray-600 mt-2">
                    Actualiza el horario de {horario.profesional.nombre}
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <HorarioForm horario={horario} />
            </div>
        </div>
    );
}
