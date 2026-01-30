'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cargarHorariosYGenerarTurnos } from '@/lib/actions/admin';

export default function LoadHorariosForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleLoadHorarios = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const result = await cargarHorariosYGenerarTurnos();
            setMessage(result.message);
            router.refresh();
        } catch (error: any) {
            setMessage(`❌ ${error.message || 'Error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={handleLoadHorarios}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
                {isLoading ? 'Cargando horarios y generando turnos...' : 'Cargar Horarios Automáticamente'}
            </button>

            {message && (
                <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}
