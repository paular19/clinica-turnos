"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfesional } from "@/lib/actions/admin";

interface ObraSocial {
    id: string;
    nombre: string;
}

interface Profesional {
    id: string;
    nombre: string;
    matricula?: string | null;
    especialidades: { id: string; nombre: string }[];
    obraSociales: { obraSocial: { id: string; nombre: string } }[];
}

export default function ManageObrasSocialesForm({
    profesional,
    obraSociales,
}: {
    profesional: Profesional;
    obraSociales: ObraSocial[];
}) {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>(
        profesional.obraSociales.map((os) => os.obraSocial.id)
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await updateProfesional(profesional.id, {
                nombre: profesional.nombre,
                matricula: profesional.matricula || undefined,
                especialidadIds: profesional.especialidades.map((e) => e.id),
                obraSocialIds: selected,
            });
            router.push("/dashboard/profesionales");
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Error al actualizar obras sociales del profesional");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <p className="text-sm text-gray-700">
                    Selecciona con qué obras sociales trabaja este profesional.
                </p>
                {obraSociales.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No hay obras sociales cargadas. Ve a "Obras Sociales" para crear y luego regresa.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {obraSociales.map((os) => (
                            <label key={os.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selected.includes(os.id)}
                                    onChange={() => toggle(os.id)}
                                />
                                <span className="text-sm text-gray-800">{os.nombre}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
