import TurnoForm from "../components/TurnoForm";
import Link from "next/link";
import { solicitudTurno } from "../../../../lib/actions/turnos";

export default function SolicitarPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6">
            <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-slate-800">Solicitud de turno</h1>
                    <Link href="/turnos" className="text-sm text-slate-600 hover:underline">Volver</Link>
                </div>
                <TurnoForm onSubmit={solicitudTurno} />
            </div>
        </div>
    );
}
