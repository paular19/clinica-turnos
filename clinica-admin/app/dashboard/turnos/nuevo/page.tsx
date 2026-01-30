import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import TurnoForm from '../TurnoForm';

const SHARED_CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";

export default async function NuevoTurnoPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const [profesionales, pacientes, especialidades] = await Promise.all([
        prisma.profesional.findMany({
            where: { clinicId: clinicId },
            include: { especialidades: true },
            orderBy: { nombre: 'asc' },
        }),
        prisma.paciente.findMany({
            where: { clinicId: clinicId },
            orderBy: { apellido: 'asc' },
        }),
        prisma.especialidad.findMany({
            where: { clinicId: clinicId },
            orderBy: { nombre: 'asc' },
        }),
    ]);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Turno</h1>
                <p className="text-gray-600 mt-2">
                    Crea un nuevo turno para un paciente
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <TurnoForm
                    profesionales={profesionales}
                    pacientes={pacientes}
                    especialidades={especialidades}
                />
            </div>
        </div>
    );
}
