import { listProfesionalesPorObraSocialYEspecialidad } from "@/lib/actions/turnos-queries";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProfesionalesPage({ searchParams }: Props) {
    const sp = (await searchParams) ?? {};

    const nombre = Array.isArray(sp.nombre) ? sp.nombre[0] : sp.nombre || "";
    const email = Array.isArray(sp.email) ? sp.email[0] : sp.email || "";
    const dni = Array.isArray(sp.dni) ? sp.dni[0] : sp.dni || "";
    const obraSocialId = Array.isArray(sp.obraSocialId) ? sp.obraSocialId[0] : sp.obraSocialId || "";
    const especialidadId = Array.isArray(sp.especialidadId) ? sp.especialidadId[0] : sp.especialidadId || "";

    if (!nombre || !email || !dni || !obraSocialId || !especialidadId) return notFound();

    const profesionales = await listProfesionalesPorObraSocialYEspecialidad(obraSocialId, especialidadId);

    return (
        <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6 pt-20">
            <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Elegí profesional</h1>
                    <Link href="/turnos" className="text-sm text-slate-600 hover:underline">Volver</Link>
                </div>

                <p className="text-sm text-slate-600 mb-6">Mostrando profesionales que atienden la obra social seleccionada y la especialidad elegida.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profesionales.map((prof: any) => (
                        <div key={prof.id} className="flex gap-4 p-4 border rounded-lg items-center">
                            {prof.fotoUrl ? (
                                <img src={prof.fotoUrl} alt={prof.nombre} className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-slate-200" />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{prof.nombre}</h3>
                                        <p className="text-sm text-slate-600">Matrícula: {prof.matricula}</p>
                                    </div>
                                    <div>
                                        <Link
                                            href={`/turnos/solicitar/horario?nombre=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&dni=${encodeURIComponent(dni)}&obraSocialId=${encodeURIComponent(obraSocialId)}&especialidadId=${encodeURIComponent(especialidadId)}&profesionalId=${prof.id}`}
                                            className="inline-block bg-[var(--brand-500)] text-white px-4 py-2 rounded-lg"
                                        >
                                            Elegir
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
