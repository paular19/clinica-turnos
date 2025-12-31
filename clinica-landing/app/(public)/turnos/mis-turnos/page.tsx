"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { buscarTurnoPorCodigo, cancelarTurno } from "../../../../lib/actions/mis-turnos-actions";

type Turno = {
    id: string;
    codigo: string;
    fecha: string;
    estado: string;
    motivo?: string | null;
    paciente: {
        nombre: string;
        apellido: string;
        dni: string;
        email: string;
    };
    profesional: {
        nombre: string;
    };
    especialidad: {
        nombre: string;
    };
};

export default function MisTurnosPage() {
    const [codigo, setCodigo] = useState("");
    const [turno, setTurno] = useState<Turno | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [canceling, setCanceling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleBuscar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setTurno(null);

        if (!codigo.trim()) {
            setError("Por favor ingresá el código de tu turno");
            return;
        }

        setLoading(true);

        try {
            const data = await buscarTurnoPorCodigo(codigo.trim());
            setTurno(data as Turno);
        } catch (err: any) {
            setError(err.message || "Error al buscar el turno");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarClick = () => {
        setShowCancelModal(true);
    };

    const handleConfirmarCancelacion = async () => {
        if (!turno) return;

        setCanceling(true);
        setError("");
        setShowCancelModal(false);

        try {
            await cancelarTurno(turno.codigo);

            // Actualizar el estado del turno localmente
            setTurno({ ...turno, estado: "CANCELADO" });
            setSuccessMessage("Turno cancelado exitosamente");
        } catch (err: any) {
            setError(err.message || "Error al cancelar el turno");
        } finally {
            setCanceling(false);
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "CONFIRMADO":
                return "bg-green-100 text-green-800 border-green-300";
            case "PENDIENTE":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "CANCELADO":
                return "bg-red-100 text-red-800 border-red-300";
            case "ASISTIDO":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "REPROGRAMADO":
                return "bg-purple-100 text-purple-800 border-purple-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const puedeSerCancelado = (turno: Turno): boolean => {
        if (turno.estado === "CANCELADO" || turno.estado === "ASISTIDO") {
            return false;
        }
        const ahora = new Date();
        const fechaTurno = new Date(turno.fecha);
        const horasRestantes = (fechaTurno.getTime() - ahora.getTime()) / (1000 * 60 * 60);
        return horasRestantes >= 12;
    };

    const getHorasRestantes = (fecha: string): number => {
        const ahora = new Date();
        const fechaTurno = new Date(fecha);
        return (fechaTurno.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6">
            <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800">Mis Turnos</h1>
                    <Link
                        href="/turnos"
                        className="text-sm text-[#4bbde3] hover:underline font-medium"
                    >
                        ← Volver
                    </Link>
                </div>

                {/* Formulario de búsqueda */}
                <form onSubmit={handleBuscar} className="mb-8">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="codigo"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Código de turno
                            </label>
                            <div className="flex gap-3">
                                <input
                                    id="codigo"
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    placeholder="Ej: paCNrfXT"
                                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#4bbde3] focus:border-transparent outline-none text-slate-800 placeholder:text-slate-400"
                                    maxLength={8}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-[#4bbde3] text-white font-semibold rounded-xl hover:bg-[#3ba5cb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Buscando..." : "Buscar"}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Ingresá el código que recibiste al sacar el turno
                            </p>
                        </div>
                    </div>
                </form>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Mensaje de éxito */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-800">✓ {successMessage}</p>
                    </div>
                )}

                {/* Datos del turno */}
                {turno && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#4bbde3]/10 to-[#4bbde3]/5 rounded-2xl p-6 border border-[#4bbde3]/20">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-slate-800">
                                    Turno #{turno.codigo}
                                </h2>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(
                                        turno.estado
                                    )}`}
                                >
                                    {turno.estado}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Fecha y hora</p>
                                    <p className="text-lg font-semibold text-slate-800">
                                        {format(new Date(turno.fecha), "EEEE d 'de' MMMM, yyyy", {
                                            locale: es,
                                        })}
                                    </p>
                                    <p className="text-md text-slate-700">
                                        {format(new Date(turno.fecha), "HH:mm")} hs
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">Especialidad</p>
                                    <p className="text-lg font-semibold text-slate-800">
                                        {turno.especialidad.nombre}
                                    </p>
                                    <p className="text-md text-slate-700">
                                        Dr/a. {turno.profesional.nombre}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">Paciente</p>
                                    <p className="text-lg font-semibold text-slate-800">
                                        {turno.paciente.nombre} {turno.paciente.apellido}
                                    </p>
                                    <p className="text-sm text-slate-600">DNI: {turno.paciente.dni}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">Email</p>
                                    <p className="text-sm text-slate-800">{turno.paciente.email}</p>
                                </div>
                            </div>

                            {turno.motivo && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-sm text-slate-500">Motivo</p>
                                    <p className="text-sm text-slate-700">{turno.motivo}</p>
                                </div>
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <Link
                                    href={`/turnos/${turno.codigo}/download`}
                                    className="flex-1 px-6 py-3 bg-[#4bbde3] text-white font-semibold rounded-xl hover:bg-[#3ba5cb] transition-colors text-center"
                                >
                                    📄 Descargar comprobante PDF
                                </Link>

                                {puedeSerCancelado(turno) && (
                                    <button
                                        onClick={handleCancelarClick}
                                        disabled={canceling}
                                        className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {canceling ? "Cancelando..." : "Cancelar turno"}
                                    </button>
                                )}
                            </div>

                            {/* Advertencia si no se puede cancelar */}
                            {turno.estado !== "CANCELADO" && turno.estado !== "ASISTIDO" && !puedeSerCancelado(turno) && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                                    <p className="text-sm text-orange-800">
                                        <span className="font-semibold">⏰ No se puede cancelar:</span> Debe cancelar con al menos 12 horas de anticipación.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Nota importante */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-sm text-yellow-800">
                                <span className="font-semibold">⚠️ Importante:</span> Recordá presentarte 15
                                minutos antes de la hora del turno con tu DNI.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de confirmación de cancelación */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                ¿Cancelar turno?
                            </h3>
                            <p className="text-slate-600">
                                ¿Estás seguro que querés cancelar este turno? Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                No, volver
                            </button>
                            <button
                                onClick={handleConfirmarCancelacion}
                                disabled={canceling}
                                className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {canceling ? "Cancelando..." : "Sí, cancelar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
