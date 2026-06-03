'use client';

import { Calendar, X } from 'lucide-react';
import { useState } from 'react';
import TurnoActions from './TurnoActions';

type TurnoTableItem = {
    id: string;
    fecha: string;
    estado: string;
    motivo: string | null;
    codigo: string;
    paciente: {
        nombre: string;
        apellido: string;
        dni: string;
        email: string;
        telefono: string | null;
        obraSocial?: {
            nombre: string;
        } | null;
    };
    profesional: {
        nombre: string;
    };
    especialidad: {
        nombre: string;
    };
};

function estadoBadgeColor(estado: string) {
    switch (estado) {
        case 'PENDIENTE':
            return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMADO':
            return 'bg-blue-100 text-blue-800';
        case 'ASISTIDO':
            return 'bg-green-100 text-green-800';
        case 'CANCELADO':
            return 'bg-red-100 text-red-800';
        case 'REPROGRAMADO':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatFecha(turnoFecha: string, clinicTimezone: string) {
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'long',
        timeZone: clinicTimezone,
    }).format(new Date(turnoFecha));
}

function formatHora(turnoFecha: string, clinicTimezone: string) {
    return new Intl.DateTimeFormat('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: clinicTimezone,
    }).format(new Date(turnoFecha));
}

function formatPacienteEmail(email?: string | null) {
    if (!email || email.endsWith('@noemail.local')) {
        return '-';
    }
    return email;
}

export default function TurnosTable({
    turnos,
    clinicTimezone,
}: {
    turnos: TurnoTableItem[];
    clinicTimezone: string;
}) {
    const [selectedTurno, setSelectedTurno] = useState<TurnoTableItem | null>(null);

    const openTurnoDetalle = (turno: TurnoTableItem) => {
        setSelectedTurno(turno);
    };

    const closeTurnoDetalle = () => {
        setSelectedTurno(null);
    };

    return (
        <>
            <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
                Hacé click en un turno para ver todos los datos cargados del paciente.
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha y Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paciente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Profesional
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Especialidad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {turnos.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No hay turnos para mostrar
                                </td>
                            </tr>
                        ) : (
                            turnos.map((turno) => (
                                <tr
                                    key={turno.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={(event) => {
                                        if ((event.target as HTMLElement).closest('button, a, input, select, textarea')) {
                                            return;
                                        }
                                        openTurnoDetalle(turno);
                                    }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar size={16} className="text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {formatFecha(turno.fecha, clinicTimezone)}
                                                </div>
                                                <div className="text-gray-500">{formatHora(turno.fecha, clinicTimezone)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {turno.paciente.nombre} {turno.paciente.apellido}
                                            </div>
                                            <div className="text-gray-500">DNI: {turno.paciente.dni}</div>
                                            <div className="text-gray-500">Tel: {turno.paciente.telefono || '-'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {turno.profesional.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {turno.especialidad.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${estadoBadgeColor(turno.estado)}`}>
                                            {turno.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        {turno.codigo}
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <TurnoActions turno={turno} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedTurno && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Detalle del turno</h2>
                            <button
                                type="button"
                                onClick={closeTurnoDetalle}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Cerrar detalle"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Paciente</h3>
                                <p className="text-sm text-gray-900"><span className="font-medium">Nombre:</span> {selectedTurno.paciente.nombre} {selectedTurno.paciente.apellido}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">DNI:</span> {selectedTurno.paciente.dni}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Teléfono:</span> {selectedTurno.paciente.telefono || '-'}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Email:</span> {formatPacienteEmail(selectedTurno.paciente.email)}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Obra social:</span> {selectedTurno.paciente.obraSocial?.nombre || '-'}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Turno</h3>
                                <p className="text-sm text-gray-900"><span className="font-medium">Fecha:</span> {formatFecha(selectedTurno.fecha, clinicTimezone)}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Hora:</span> {formatHora(selectedTurno.fecha, clinicTimezone)}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Profesional:</span> {selectedTurno.profesional.nombre}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Especialidad:</span> {selectedTurno.especialidad.nombre}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Estado:</span> {selectedTurno.estado}</p>
                                <p className="text-sm text-gray-900"><span className="font-medium">Código:</span> {selectedTurno.codigo}</p>
                            </div>

                            <div className="md:col-span-2 rounded-lg border bg-gray-50 px-4 py-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Motivo de consulta</h3>
                                <p className="mt-1 text-sm text-gray-900">{selectedTurno.motivo || '-'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end border-t px-6 py-4">
                            <button
                                type="button"
                                onClick={closeTurnoDetalle}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}