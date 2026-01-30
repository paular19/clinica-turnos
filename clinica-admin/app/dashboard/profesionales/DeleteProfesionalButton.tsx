'use client';

import { deleteProfesional } from '@/lib/actions/admin';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteProfesionalButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');
        try {
            await deleteProfesional(id);
            setShowModal(false);
            router.refresh();
        } catch (error: any) {
            setError(error.message || 'Error al eliminar el profesional');
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                title="Eliminar profesional"
            >
                <Trash2 size={18} />
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 text-left">
                                    ¿Eliminar profesional?
                                </h3>
                                <div className="mt-2 space-y-2 text-left">
                                    <p className="text-sm text-gray-600">
                                        Se eliminarán todos los turnos, horarios y relaciones.
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
                                    setError('');
                                }}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
