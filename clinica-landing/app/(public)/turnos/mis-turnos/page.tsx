"use client";

import Link from "next/link";

export default function MisTurnosPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6">
            <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-slate-800">Mis turnos</h1>
                    <Link href="/turnos" className="text-sm text-slate-600 hover:underline">Volver</Link>
                </div>
                <p className="text-slate-600">Aquí verás tus turnos (pendiente de implementar listado y autenticación).</p>
            </div>
        </div>
    );
}
