import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ProfesionalForm from '../ProfesionalForm';
import { SHARED_CLINIC_ID } from '@/lib/config/clinic';

export default async function NuevoProfesionalPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Obtener el usuario o el primer clinic disponible
    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    // Si no existe usuario, usar el CLINIC_ID compartido
    let clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const especialidades = await prisma.especialidad.findMany({
        where: {
            clinicId: clinicId,
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    const obraSociales = await prisma.obraSocial.findMany({
        where: {
            clinicId: clinicId,
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Profesional</h1>
                <p className="text-gray-600 mt-2">
                    Registra un nuevo profesional en el sistema
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <ProfesionalForm
                    especialidades={especialidades}
                    obraSociales={obraSociales}
                />
            </div>
        </div>
    );
}
