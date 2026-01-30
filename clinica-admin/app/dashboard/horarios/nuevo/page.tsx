import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import HorarioForm from '../HorarioForm';

const SHARED_CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";

export default async function NuevoHorarioPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const profesionales = await prisma.profesional.findMany({
        where: {
            clinicId: clinicId,
        },
        include: {
            especialidades: true,
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Horario</h1>
                <p className="text-gray-600 mt-2">
                    Configura un nuevo horario de atención para un profesional
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <HorarioForm profesionales={profesionales} />
            </div>
        </div>
    );
}
