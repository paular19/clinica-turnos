'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTurno } from '@/lib/actions/turnos';

interface Profesional {
    id: string;
    nombre: string;
    especialidades: { id: string; nombre: string }[];
}

interface Paciente {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
}

interface Especialidad {
    id: string;
    nombre: string;
}

export default function TurnoForm({
    profesionales,
    pacientes,
    especialidades,
}: {
    profesionales: Profesional[];
    pacientes: Paciente[];
    especialidades: Especialidad[];
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProfesional, setSelectedProfesional] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const fechaStr = formData.get('fecha') as string;
        const horaStr = formData.get('hora') as string;
        const pacienteId = formData.get('pacienteId') as string;
        const profesionalId = formData.get('profesionalId') as string;
        const especialidadId = formData.get('especialidadId') as string;
        const motivo = formData.get('motivo') as string;

        // Combinar fecha y hora
        const fecha = new Date(`${fechaStr}T${horaStr}:00`);

        try {
            await createTurno({
                fecha,
                pacienteId,
                profesionalId,
                especialidadId,
                motivo: motivo || undefined,
            });

            router.push('/dashboard/turnos');
            router.refresh();
        } catch (error) {
            alert('Error al crear el turno');
            setIsSubmitting(false);
        }
    };

    // Filtrar especialidades del profesional seleccionado
    const especialidadesDisponibles = selectedProfesional
        ? profesionales
            .find((p) => p.id === selectedProfesional)
            ?.especialidades || []
        : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700 mb-2">
                    Paciente *
                </label>
                <select
                    id="pacienteId"
                    name="pacienteId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Seleccionar paciente</option>
                    {pacientes.map((pac) => (
                        <option key={pac.id} value={pac.id}>
                            {pac.apellido}, {pac.nombre} - DNI: {pac.dni}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="profesionalId" className="block text-sm font-medium text-gray-700 mb-2">
                    Profesional *
                </label>
                <select
                    id="profesionalId"
                    name="profesionalId"
                    required
                    value={selectedProfesional}
                    onChange={(e) => setSelectedProfesional(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Seleccionar profesional</option>
                    {profesionales.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                            {prof.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="especialidadId" className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad *
                </label>
                <select
                    id="especialidadId"
                    name="especialidadId"
                    required
                    disabled={!selectedProfesional}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                    <option value="">Seleccionar especialidad</option>
                    {especialidadesDisponibles.map((esp) => (
                        <option key={esp.id} value={esp.id}>
                            {esp.nombre}
                        </option>
                    ))}
                </select>
                {!selectedProfesional && (
                    <p className="text-sm text-gray-500 mt-1">
                        Primero selecciona un profesional
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha *
                    </label>
                    <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-2">
                        Hora *
                    </label>
                    <input
                        type="time"
                        id="hora"
                        name="hora"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la Consulta
                </label>
                <textarea
                    id="motivo"
                    name="motivo"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el motivo de la consulta (opcional)"
                />
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Guardando...' : 'Crear Turno'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
