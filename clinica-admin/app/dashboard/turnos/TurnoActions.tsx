'use client';

import { cancelarTurno, marcarAsistido } from '@/lib/actions/turnos';
import { X, UserCheck } from 'lucide-react';
import { useState } from 'react';

export default function TurnoActions({ turno }: { turno: any }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const confirmCancelar = async () => {
        setIsProcessing(true);
        try {
            await cancelarTurno(turno.id, cancelReason.trim() || undefined);
            setShowCancelModal(false);
            setCancelReason('');
        } catch (error) {
            alert('Error al cancelar el turno');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMarcarAsistido = async () => {
        if (!confirm('¿Marcar como asistido?')) return;

        setIsProcessing(true);
        try {
            await marcarAsistido(turno.id);
        } catch (error) {
            alert('Error al marcar el turno');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="flex justify-end gap-2">
                {turno.estado === 'PENDIENTE' && (
                    <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                        title="Cancelar"
                    >
                        <X size={18} />
                        <span className="text-sm">Cancelar</span>
                    </button>
                )}

                {turno.estado === 'CONFIRMADO' && (
                    <>
                        <button
                            onClick={handleMarcarAsistido}
                            disabled={isProcessing}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
                            title="Marcar como asistido"
                        >
                            <UserCheck size={18} />
                        </button>
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                            title="Cancelar"
                        >
                            <X size={18} />
                            <span className="text-sm">Cancelar</span>
                        </button>
                    </>
                )}

                {(turno.estado === 'ASISTIDO' || turno.estado === 'CANCELADO') && (
                    <span className="text-xs text-gray-400">No hay acciones disponibles</span>
                )}
            </div>
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Cancelar turno</h3>
                        <p className="text-sm text-gray-600">Opcional: agrega un motivo para la cancelación.</p>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Motivo (opcional)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Volver
                            </button>
                            <button
                                type="button"
                                onClick={confirmCancelar}
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isProcessing ? 'Cancelando...' : 'Confirmar cancelación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
