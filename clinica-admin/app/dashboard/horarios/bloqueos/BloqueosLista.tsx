'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eliminarBloqueo } from '@/lib/actions/bloqueos';
import { Trash2, Calendar, User, AlertTriangle } from 'lucide-react';

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
    const [showModal, setShowModal] = useState(false);
    const [bloqueoAEliminar, setBloqueoAEliminar] = useState<Bloqueo | null>(null);
    const [error, setError] = useState('');

    const handleEliminar = async (bloqueoId: string) => {
        setEliminando(bloqueoId);
        try {
            await eliminarBloqueo(bloqueoId);
            setShowModal(false);
            setBloqueoAEliminar(null);
            router.refresh();
        } catch (error: any) {
            setError(error.message || 'Error al eliminar el bloqueo');
        } finally {
            setEliminando(null);
        }
    };

    const abrirModalEliminar = (bloqueo: Bloqueo) => {
        setBloqueoAEliminar(bloqueo);
        setError('');
        setShowModal(true);
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
        <>
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
                                        onClick={() => abrirModalEliminar(bloqueo)}
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

            {showModal && bloqueoAEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 text-left">
                                    ¿Eliminar bloqueo?
                                </h3>
                                <div className="mt-2 space-y-2 text-left">
                                    <p className="text-sm text-gray-600">
                                        Se quitará el bloqueo para {bloqueoAEliminar.profesional.nombre}.
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Esta acción no se puede deshacer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800 text-left">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setBloqueoAEliminar(null);
                                    setError('');
                                }}
                                disabled={eliminando === bloqueoAEliminar.id}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => handleEliminar(bloqueoAEliminar.id)}
                                disabled={eliminando === bloqueoAEliminar.id}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {eliminando === bloqueoAEliminar.id ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
