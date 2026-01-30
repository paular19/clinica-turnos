'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock, X } from 'lucide-react';
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

    const handleMarcarAsistido = async () => {
        if (!confirm('¿Marcar este turno como asistido?')) return;

        setIsLoading(true);
        try {
            await marcarAsistido(turnoId);
            router.refresh();
        } catch (error) {
            alert('Error al marcar como asistido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarcarRetrasado = async () => {
        if (!confirm('¿Marcar este turno como retrasado?')) return;

        setIsLoading(true);
        try {
            await marcarRetrasado(turnoId);
            router.refresh();
        } catch (error) {
            alert('Error al marcar como retrasado');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarcarAusencia = async () => {
        if (!confirm('¿Marcar este turno como ausencia del paciente?')) return;

        setIsLoading(true);
        try {
            await marcarAusencia(turnoId);
            router.refresh();
        } catch (error) {
            alert('Error al marcar como ausencia');
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
                        onClick={handleMarcarAsistido}
                        disabled={isLoading}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Marcar como asistido"
                    >
                        <Check size={18} />
                    </button>
                    <button
                        onClick={handleMarcarRetrasado}
                        disabled={isLoading}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Marcar como retrasado"
                    >
                        <Clock size={18} />
                    </button>
                    <button
                        onClick={handleMarcarAusencia}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Marcar como ausencia"
                    >
                        <X size={18} />
                    </button>
                </>
            )}
        </div>
    );
}
