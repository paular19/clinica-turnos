'use client';

import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Profesional {
    id: string;
    nombre: string;
}

export default function TurnosFiltros({
    profesionales
}: {
    profesionales: Profesional[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleProfesionalChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('profesional', value);
        } else {
            params.delete('profesional');
        }
        router.push(`/dashboard/turnos?${params.toString()}`);
    };

    const handleEstadoChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('estado', value);
        } else {
            params.delete('estado');
        }
        router.push(`/dashboard/turnos?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-gray-600" />
                <h2 className="font-semibold text-gray-900">Filtros</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profesional
                    </label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={searchParams.get('profesional') || ''}
                        onChange={(e) => handleProfesionalChange(e.target.value)}
                    >
                        <option value="">Todos los profesionales</option>
                        {profesionales.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                                {prof.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                    </label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={searchParams.get('estado') || ''}
                        onChange={(e) => handleEstadoChange(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="ASISTIDO">Asistido</option>
                        <option value="CANCELADO">Cancelado</option>
                        <option value="REPROGRAMADO">Reprogramado</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
