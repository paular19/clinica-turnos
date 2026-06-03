import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import TurnosFiltros from './TurnosFiltros';
import TurnosTable from './TurnosTable';

const SHARED_CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";
const CLINIC_TIMEZONE = 'America/Argentina/Buenos_Aires';

export default async function TurnosPage({
    searchParams,
}: {
    searchParams: Promise<{ profesional?: string; estado?: string }>;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const params = await searchParams;

    const usuario = await prisma.usuario.findUnique({
        where: { clerkId: userId },
    });

    let clinicId = usuario?.clinicId || SHARED_CLINIC_ID;

    const profesionales = await prisma.profesional.findMany({
        where: {
            clinicId: clinicId,
        },
        orderBy: {
            nombre: 'asc',
        },
    });

    // Construir filtros
    const where: any = {
        clinicId: clinicId,
    };

    if (params.profesional) {
        where.profesionalId = params.profesional;
    }

    if (params.estado) {
        where.estado = params.estado;
    }

    const turnos = await prisma.turno.findMany({
        where,
        include: {
            paciente: {
                include: {
                    obraSocial: {
                        select: { nombre: true },
                    },
                },
            },
            profesional: true,
            especialidad: true,
        },
        orderBy: {
            fecha: 'desc',
        },
        take: 100,
    });

    const turnosForTable = turnos.map((turno) => ({
        ...turno,
        fecha: turno.fecha.toISOString(),
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
                    <p className="text-gray-600 mt-2">
                        Visualiza y administra todos los turnos
                    </p>
                </div>
                <Link
                    href="/dashboard/turnos/nuevo"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Turno
                </Link>
            </div>

            {/* Filtros */}
            <TurnosFiltros profesionales={profesionales} />

            {/* Lista de turnos */}
            <TurnosTable turnos={turnosForTable} clinicTimezone={CLINIC_TIMEZONE} />
        </div>
    );
}
