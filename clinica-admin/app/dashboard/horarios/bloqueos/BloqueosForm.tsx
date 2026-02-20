'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearBloqueo } from '@/lib/actions/bloqueos';
import { Calendar, AlertCircle } from 'lucide-react';

type Profesional = {
    id: string;
    nombre: string;
};

export default function BloqueosForm({ profesionales }: { profesionales: Profesional[] }) {
    const router = useRouter();
    const TODOS_VALUE = '__TODOS__';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [profesionalId, setProfesionalId] = useState('');
    const [fecha, setFecha] = useState('');
    const [motivo, setMotivo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            if (!profesionalId) {
                throw new Error('Seleccioná un profesional');
            }
            if (!fecha) {
                throw new Error('Seleccioná una fecha');
            }

            const bloquearTodos = profesionalId === TODOS_VALUE;

            await crearBloqueo({
                profesionalId: bloquearTodos ? undefined : profesionalId,
                todosLosProfesionales: bloquearTodos,
                fecha: new Date(fecha),
                motivo: motivo || undefined,
            });

            // Resetear formulario
            setProfesionalId('');
            setFecha('');
            setMotivo('');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al crear el bloqueo');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fecha mínima: mañana
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                    Bloquear Día
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profesional */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profesional *
                    </label>
                    <select
                        value={profesionalId}
                        onChange={(e) => setProfesionalId(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar profesional</option>
                        <option value={TODOS_VALUE}>Todos los profesionales</option>
                        {profesionales.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                                {prof.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fecha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha *
                    </label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        min={minDateStr}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Motivo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo (opcional)
                    </label>
                    <input
                        type="text"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Feriado, Vacaciones, Capacitación"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Botón */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {isSubmitting ? 'Bloqueando...' : 'Bloquear Día'}
                </button>
            </form>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                    ℹ️ Al bloquear un día, se cancelarán automáticamente los turnos programados para el/los profesionales seleccionados en esa fecha.
                </p>
            </div>
        </div>
    );
}
