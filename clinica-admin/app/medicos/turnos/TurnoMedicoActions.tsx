'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCircle, Clock, X } from 'lucide-react';
import { marcarAsistido, marcarRetrasado, marcarAusencia } from '@/lib/actions/medicos';

export default function TurnoMedicoActions({
    turnoId,
    estado,
}: {
    turnoId: string;
    estado: string;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showAsistidoModal, setShowAsistidoModal] = useState(false);
    const [showRetrasadoModal, setShowRetrasadoModal] = useState(false);
    const [showAusenciaModal, setShowAusenciaModal] = useState(false);
    const [asistidoError, setAsistidoError] = useState('');
    const [retrasadoError, setRetrasadoError] = useState('');
    const [ausenciaError, setAusenciaError] = useState('');

    const handleMarcarAsistido = async () => {
        setIsLoading(true);
        setAsistidoError('');
        try {
            await marcarAsistido(turnoId);
            setShowAsistidoModal(false);
            router.refresh();
        } catch (error) {
            setAsistidoError('Error al marcar como asistido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarcarRetrasado = async () => {
        setIsLoading(true);
        setRetrasadoError('');
        try {
            await marcarRetrasado(turnoId);
            setShowRetrasadoModal(false);
            router.refresh();
        } catch (error) {
            setRetrasadoError('Error al marcar como retrasado');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarcarAusencia = async () => {
        setIsLoading(true);
        setAusenciaError('');
        try {
            await marcarAusencia(turnoId);
            setShowAusenciaModal(false);
            router.refresh();
        } catch (error) {
            setAusenciaError('Error al marcar como ausencia');
        } finally {
            setIsLoading(false);
        }
    };

    // Turnos ya finalizados no se pueden modificar
    if (estado === 'ASISTIDO' || estado === 'CANCELADO' || estado === 'AUSENCIA') {
        return <span className="text-gray-400 text-sm">-</span>;
    }

    return (
        <div className="flex gap-1">
            {(estado === 'RETRASADO' || estado === 'PENDIENTE' || estado === 'CONFIRMADO') && (
                <>
                    <button
                        onClick={() => setShowAsistidoModal(true)}
                        disabled={isLoading}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Marcar como asistido"
                    >
                        <Check size={18} />
                    </button>
                    <button
                        onClick={() => setShowRetrasadoModal(true)}
                        disabled={isLoading}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Marcar como retrasado"
                    >
                        <Clock size={18} />
                    </button>
                    <button
                        onClick={() => setShowAusenciaModal(true)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Marcar como ausencia"
                    >
                        <X size={18} />
                    </button>
                </>
            )}

            {showAsistidoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 text-left">
                                    ¿Marcar turno como asistido?
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    El turno quedará finalizado como asistido.
                                </p>
                            </div>
                        </div>

                        {asistidoError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800 text-left">{asistidoError}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAsistidoModal(false);
                                    setAsistidoError('');
                                }}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleMarcarAsistido}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Marcando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRetrasadoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Clock className="text-orange-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 text-left">
                                    ¿Marcar turno como retrasado?
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Se indicara que el paciente sera atendido con demora.
                                </p>
                            </div>
                        </div>

                        {retrasadoError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800 text-left">{retrasadoError}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRetrasadoModal(false);
                                    setRetrasadoError('');
                                }}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleMarcarRetrasado}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Marcando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAusenciaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div className="flex items-start gap-3 text-left">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <X className="text-red-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 text-left">
                                    ¿Marcar turno como ausencia?
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    El paciente quedara marcado como ausente.
                                </p>
                            </div>
                        </div>

                        {ausenciaError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800 text-left">{ausenciaError}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAusenciaModal(false);
                                    setAusenciaError('');
                                }}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleMarcarAusencia}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Marcando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
