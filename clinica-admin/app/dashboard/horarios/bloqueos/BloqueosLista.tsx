'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eliminarBloqueo } from '@/lib/actions/bloqueos';
import { Trash2, Calendar, User } from 'lucide-react';

type Bloqueo = {
    id: string;
    fecha: Date;
    motivo: string | null;
    profesional: {
        id: string;
        nombre: string;
    };
};

export default function BloqueosLista({ bloqueos }: { bloqueos: Bloqueo[] }) {
    const router = useRouter();
    const [eliminando, setEliminando] = useState<string | null>(null);

    const handleEliminar = async (bloqueoId: string) => {
        if (!confirm('¿Estás seguro de eliminar este bloqueo?')) return;

        setEliminando(bloqueoId);
        try {
            await eliminarBloqueo(bloqueoId);
            router.refresh();
        } catch (error: any) {
            alert(error.message || 'Error al eliminar');
        } finally {
            setEliminando(null);
        }
    };

    const formatearFecha = (fecha: Date) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bloqueos Activos ({bloqueos.length})
            </h2>

            {bloqueos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No hay días bloqueados</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {bloqueos.map((bloqueo) => (
                        <div
                            key={bloqueo.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                    {/* Profesional */}
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-900">
                                            {bloqueo.profesional.nombre}
                                        </span>
                                    </div>

                                    {/* Fecha */}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600 capitalize">
                                            {formatearFecha(bloqueo.fecha)}
                                        </span>
                                    </div>

                                    {/* Motivo */}
                                    {bloqueo.motivo && (
                                        <div className="text-sm text-gray-500 italic">
                                            {bloqueo.motivo}
                                        </div>
                                    )}
                                </div>

                                {/* Botón eliminar */}
                                <button
                                    onClick={() => handleEliminar(bloqueo.id)}
                                    disabled={eliminando === bloqueo.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Eliminar bloqueo"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
