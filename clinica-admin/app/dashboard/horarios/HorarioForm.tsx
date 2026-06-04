'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHorario, updateHorario } from '@/lib/actions/admin';

const DIAS_SEMANA = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' },
];

function diaSemanaToFormValue(diaSemana?: number) {
    if (diaSemana === 0) return '7';
    return typeof diaSemana === 'number' ? String(diaSemana) : '';
}

interface Profesional {
    id: string;
    nombre: string;
    especialidades: { nombre: string }[];
}

interface Horario {
    id: string;
    profesionalId: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    intervaloMin: number;
    profesional: Profesional;
}

export default function HorarioForm({
    profesionales,
    horario,
}: {
    profesionales?: Profesional[];
    horario?: Horario;
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profesionalId, setProfesionalId] = useState(horario?.profesionalId ?? '');
    const [diaSemana, setDiaSemana] = useState(diaSemanaToFormValue(horario?.diaSemana));
    const [horaInicio, setHoraInicio] = useState(horario?.horaInicio ?? '');
    const [horaFin, setHoraFin] = useState(horario?.horaFin ?? '');
    const [intervaloMin, setIntervaloMin] = useState(horario ? String(horario.intervaloMin) : '');

    useEffect(() => {
        setProfesionalId(horario?.profesionalId ?? '');
        setDiaSemana(diaSemanaToFormValue(horario?.diaSemana));
        setHoraInicio(horario?.horaInicio ?? '');
        setHoraFin(horario?.horaFin ?? '');
        setIntervaloMin(horario ? String(horario.intervaloMin) : '');
    }, [horario]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const diaSemanaValue = parseInt(diaSemana, 10);
            const intervaloMinValue = parseInt(intervaloMin, 10);

            if (horario) {
                await updateHorario(horario.id, {
                    diaSemana: diaSemanaValue,
                    horaInicio,
                    horaFin,
                    intervaloMin: intervaloMinValue,
                });
            } else {
                await createHorario({
                    profesionalId,
                    diaSemana: diaSemanaValue,
                    horaInicio,
                    horaFin,
                    intervaloMin: intervaloMinValue,
                });
            }

            router.push('/dashboard/horarios');
            router.refresh();
        } catch (error) {
            alert(`Error al ${horario ? 'actualizar' : 'crear'} el horario`);
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="profesionalId" className="block text-sm font-medium text-gray-700 mb-2">
                    Profesional *
                </label>
                {horario ? (
                    <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                        {horario.profesional.nombre} - {horario.profesional.especialidades.map(e => e.nombre).join(', ')}
                    </div>
                ) : (
                    <select
                        id="profesionalId"
                        name="profesionalId"
                        required
                        value={profesionalId}
                        onChange={(e) => setProfesionalId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar profesional</option>
                        {profesionales?.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                                {prof.nombre} - {prof.especialidades.map(e => e.nombre).join(', ')}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div>
                <label htmlFor="diaSemana" className="block text-sm font-medium text-gray-700 mb-2">
                    Día de la Semana *
                </label>
                <select
                    id="diaSemana"
                    name="diaSemana"
                    required
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Seleccionar día</option>
                    {DIAS_SEMANA.map((dia) => (
                        <option key={dia.value} value={dia.value}>
                            {dia.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Inicio *
                    </label>
                    <input
                        type="time"
                        id="horaInicio"
                        name="horaInicio"
                        required
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Fin *
                    </label>
                    <input
                        type="time"
                        id="horaFin"
                        name="horaFin"
                        required
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="intervaloMin" className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo entre turnos (minutos) *
                </label>
                <select
                    id="intervaloMin"
                    name="intervaloMin"
                    required
                    value={intervaloMin}
                    onChange={(e) => setIntervaloMin(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Seleccionar intervalo</option>
                    <option value="15">15 minutos</option>
                    <option value="20">20 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                    Define cada cuánto tiempo se puede asignar un turno
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Horario'}
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
