import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db/prisma";
const prisma = getPrisma();


interface Props {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ConfirmacionPage({ searchParams }: Props) {
    const sp = (await searchParams) ?? {};
    const codigo = Array.isArray(sp.codigo) ? sp.codigo[0] : sp.codigo || "";

    if (!codigo) return notFound();

    const turno = await prisma.turno.findUnique({
        where: { codigo },
        include: {
            paciente: true,
            profesional: true,
            especialidad: true,
        },
    });

    if (!turno) return notFound();

    const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(turno.fecha));

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6">
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                        <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        ¡Turno confirmado!
                    </h1>
                    <p className="text-slate-600">
                        Tu turno ha sido agendado exitosamente
                    </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 mb-6 space-y-4">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Código de turno</p>
                            <p className="text-2xl font-bold text-[#4bbde3]">{turno.codigo}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Paciente</p>
                            <p className="font-semibold text-slate-800">
                                {turno.paciente.nombre} {turno.paciente.apellido}
                            </p>
                            <p className="text-sm text-slate-600">DNI: {turno.paciente.dni}</p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500 mb-1">Profesional</p>
                            <p className="font-semibold text-slate-800">
                                {turno.profesional.nombre}
                            </p>
                            <p className="text-sm text-slate-600">{turno.especialidad.nombre}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500 mb-1">Fecha y hora</p>
                        <p className="font-semibold text-slate-800 capitalize">
                            {fechaFormateada}
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Guardá este código de turno. Lo vas a
                        necesitar para consultar o cancelar tu turno.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={`/turnos/${codigo}/download`}
                        className="flex-1 py-3 px-6 rounded-xl text-white font-semibold bg-gradient-to-r from-[#4bbde3] to-[#2b8fb8] hover:shadow-lg transition text-center"
                    >
                        Descargar comprobante
                    </Link>
                    <Link
                        href="/turnos"
                        className="flex-1 py-3 px-6 rounded-xl text-slate-700 font-semibold bg-white border-2 border-slate-300 hover:bg-slate-50 transition text-center"
                    >
                        Volver al inicio
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Se envió un email de confirmación a{" "}
                        <span className="font-semibold">{turno.paciente.email}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
