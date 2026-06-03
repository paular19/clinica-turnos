'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPacienteParaTurno, createTurno, getProximosSlotsParaTurno } from '@/lib/actions/turnos';
import { AlertCircle, UserPlus } from 'lucide-react';

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

interface SlotDisponible {
    fecha: string;
    dia: string;
    hora: string;
}

const SLOT_WINDOW_DAYS = 30;

function toISODateLocal(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addDaysISO(isoDate: string, days: number) {
    const base = new Date(`${isoDate}T00:00:00`);
    base.setDate(base.getDate() + days);
    return toISODateLocal(base);
}

function formatISODate(isoDate: string) {
    const parsed = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parsed);
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
    const [selectedPacienteId, setSelectedPacienteId] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [slotsDisponibles, setSlotsDisponibles] = useState<SlotDisponible[]>([]);
    const [slotsDesde, setSlotsDesde] = useState(() => toISODateLocal(new Date()));
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState('');
    const [pacientesList, setPacientesList] = useState<Paciente[]>(pacientes);
    const [showNuevoPaciente, setShowNuevoPaciente] = useState(false);
    const [isCreatingPaciente, setIsCreatingPaciente] = useState(false);
    const [turnoError, setTurnoError] = useState('');
    const [pacienteError, setPacienteError] = useState('');
    const [nuevoPaciente, setNuevoPaciente] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
    });
    const hoyISO = toISODateLocal(new Date());
    const puedeRetrocederRango = slotsDesde > hoyISO;
    const rangoHasta = addDaysISO(slotsDesde, SLOT_WINDOW_DAYS - 1);

    const ordenarPacientes = (lista: Paciente[]) => {
        return [...lista].sort((a, b) => {
            const apellidos = a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
            if (apellidos !== 0) return apellidos;
            return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
        });
    };

    const handleCrearPaciente = async () => {
        setPacienteError('');
        const nombre = nuevoPaciente.nombre.trim();
        const apellido = nuevoPaciente.apellido.trim();
        const dni = nuevoPaciente.dni.trim();
        const email = nuevoPaciente.email.trim();
        const telefono = nuevoPaciente.telefono.trim();

        if (!nombre || !apellido || !dni || !telefono) {
            setPacienteError('Completá nombre, apellido, DNI y telefono');
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setPacienteError('El email no tiene un formato valido');
            return;
        }

        setIsCreatingPaciente(true);

        try {
            const pacienteCreado = await createPacienteParaTurno({
                nombre,
                apellido,
                dni,
                email: email || undefined,
                telefono,
            });

            setPacientesList((prev) => ordenarPacientes([...prev, pacienteCreado]));
            setSelectedPacienteId(pacienteCreado.id);
            setNuevoPaciente({ nombre: '', apellido: '', dni: '', email: '', telefono: '' });
            setShowNuevoPaciente(false);
        } catch (error: any) {
            setPacienteError(error.message || 'No se pudo crear el paciente');
        } finally {
            setIsCreatingPaciente(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTurnoError('');

        const formData = new FormData(e.currentTarget);
        const selectedSlotValue = selectedSlot;
        const pacienteId = selectedPacienteId;
        const profesionalId = formData.get('profesionalId') as string;
        const especialidadId = formData.get('especialidadId') as string;
        const motivo = formData.get('motivo') as string;

        if (!pacienteId) {
            setTurnoError('Seleccioná un paciente o cargá uno nuevo');
            setIsSubmitting(false);
            return;
        }

        if (!selectedSlotValue) {
            setTurnoError('Seleccioná un día y horario disponible');
            setIsSubmitting(false);
            return;
        }

        const [fechaStr, horaStr] = selectedSlotValue.split('|');
        if (!fechaStr || !horaStr) {
            setTurnoError('Horario inválido. Seleccioná otro horario disponible');
            setIsSubmitting(false);
            return;
        }

        const fecha = new Date(`${fechaStr}T${horaStr}:00-03:00`);

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
        } catch (error: any) {
            setTurnoError(error.message || 'Error al crear el turno');
            setIsSubmitting(false);
        }
    };

    // Filtrar especialidades del profesional seleccionado
    const especialidadesDisponibles = selectedProfesional
        ? profesionales
            .find((p) => p.id === selectedProfesional)
            ?.especialidades || []
        : [];

    useEffect(() => {
        const cargarSlots = async () => {
            if (!selectedProfesional) {
                setSlotsDisponibles([]);
                setSelectedSlot('');
                setSlotsError('');
                return;
            }

            setIsLoadingSlots(true);
            setSlotsError('');
            setSelectedSlot('');

            try {
                const slots = await getProximosSlotsParaTurno({
                    profesionalId: selectedProfesional,
                    dias: SLOT_WINDOW_DAYS,
                    desde: slotsDesde,
                });
                setSlotsDisponibles(slots);
            } catch (error: any) {
                setSlotsDisponibles([]);
                setSlotsError(error.message || 'No se pudo cargar la disponibilidad');
            } finally {
                setIsLoadingSlots(false);
            }
        };

        cargarSlots();
    }, [selectedProfesional, slotsDesde]);

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
                    value={selectedPacienteId}
                    onChange={(e) => setSelectedPacienteId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Seleccionar paciente</option>
                    {pacientesList.map((pac) => (
                        <option key={pac.id} value={pac.id}>
                            {pac.apellido}, {pac.nombre} - DNI: {pac.dni}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => {
                        setShowNuevoPaciente((prev) => !prev);
                        setPacienteError('');
                    }}
                    className="mt-2 inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
                >
                    <UserPlus size={16} />
                    {showNuevoPaciente ? 'Cancelar alta de paciente' : 'No está en la lista? Cargar paciente'}
                </button>

                {showNuevoPaciente && (
                    <div className="mt-3 p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Nombre *"
                                value={nuevoPaciente.nombre}
                                onChange={(e) => setNuevoPaciente((prev) => ({ ...prev, nombre: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="Apellido *"
                                value={nuevoPaciente.apellido}
                                onChange={(e) => setNuevoPaciente((prev) => ({ ...prev, apellido: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="DNI *"
                                value={nuevoPaciente.dni}
                                onChange={(e) => setNuevoPaciente((prev) => ({ ...prev, dni: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="email"
                                placeholder="Email (opcional)"
                                value={nuevoPaciente.email}
                                onChange={(e) => setNuevoPaciente((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <input
                            type="tel"
                            placeholder="Telefono *"
                            required
                            value={nuevoPaciente.telefono}
                            onChange={(e) => setNuevoPaciente((prev) => ({ ...prev, telefono: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {pacienteError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700">{pacienteError}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleCrearPaciente}
                                disabled={isCreatingPaciente}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isCreatingPaciente ? 'Guardando paciente...' : 'Guardar paciente y seleccionar'}
                            </button>
                        </div>
                    </div>
                )}
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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Día y horario disponible *
                </label>

                {selectedProfesional && (
                    <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-gray-600">
                            Mostrando del {formatISODate(slotsDesde)} al {formatISODate(rangoHasta)}
                        </p>
                        <div className="flex gap-2">
                            {puedeRetrocederRango && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const candidato = addDaysISO(slotsDesde, -SLOT_WINDOW_DAYS);
                                        setSlotsDesde(candidato < hoyISO ? hoyISO : candidato);
                                    }}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white"
                                >
                                    30 días anteriores
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setSlotsDesde(addDaysISO(slotsDesde, SLOT_WINDOW_DAYS))}
                                className="px-3 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                            >
                                Próximos 30 días
                            </button>
                        </div>
                    </div>
                )}

                {!selectedProfesional ? (
                    <p className="text-sm text-gray-500">Primero seleccioná un profesional</p>
                ) : isLoadingSlots ? (
                    <p className="text-sm text-gray-500">Cargando disponibilidad...</p>
                ) : slotsError ? (
                    <p className="text-sm text-red-600">{slotsError}</p>
                ) : slotsDisponibles.length === 0 ? (
                    <p className="text-sm text-amber-700">No hay turnos disponibles en el rango seleccionado para este profesional.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {slotsDisponibles.map((slot) => (
                            <label key={`${slot.fecha}-${slot.hora}`} className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="fechaHora"
                                    value={`${slot.fecha}|${slot.hora}`}
                                    required
                                    checked={selectedSlot === `${slot.fecha}|${slot.hora}`}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    className="peer sr-only"
                                />
                                <div className="border-2 border-slate-200 rounded-lg p-3 text-center transition-all hover:border-blue-500 hover:bg-blue-50 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white">
                                    <div className="text-xs font-medium capitalize">{slot.dia}</div>
                                    <div className="text-lg font-bold mt-1">{slot.hora}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <input type="hidden" name="fechaHora" value={selectedSlot} />
                </div>

                <div>
                    {/* reservado para mantener layout */}
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

            {turnoError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{turnoError}</p>
                </div>
            )}
        </form>
    );
}
