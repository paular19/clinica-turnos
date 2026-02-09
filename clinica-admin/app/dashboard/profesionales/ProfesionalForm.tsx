'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProfesional, updateProfesional } from '@/lib/actions/admin';

interface Especialidad {
    id: string;
    nombre: string;
}

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

export default function ProfesionalForm({
    especialidades,
    obraSociales,
    profesional,
}: {
    especialidades: Especialidad[];
    obraSociales: ObraSocial[];
    profesional?: Profesional;
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nombre, setNombre] = useState(profesional?.nombre ?? '');
    const [matricula, setMatricula] = useState(profesional?.matricula ?? '');
    const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>(
        profesional?.especialidades.map(e => e.id) || []
    );
    const [selectedObrasSociales, setSelectedObrasSociales] = useState<string[]>(
        profesional?.obraSociales.map(os => os.obraSocial.id) || []
    );

    useEffect(() => {
        setNombre(profesional?.nombre ?? '');
        setMatricula(profesional?.matricula ?? '');
        setSelectedEspecialidades(profesional?.especialidades.map(e => e.id) || []);
        setSelectedObrasSociales(profesional?.obraSociales.map(os => os.obraSocial.id) || []);
    }, [profesional]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (profesional) {
                await updateProfesional(profesional.id, {
                    nombre,
                    matricula: matricula || undefined,
                    especialidadIds: selectedEspecialidades,
                    obraSocialIds: selectedObrasSociales,
                });
            } else {
                await createProfesional({
                    nombre,
                    matricula: matricula || undefined,
                    especialidadIds: selectedEspecialidades,
                    obraSocialIds: selectedObrasSociales,
                });
            }

            router.push('/dashboard/profesionales');
            router.refresh();
        } catch (error) {
            alert(`Error al ${profesional ? 'actualizar' : 'crear'} el profesional`);
            setIsSubmitting(false);
        }
    };

    const toggleEspecialidad = (id: string) => {
        setSelectedEspecialidades(prev =>
            prev.includes(id)
                ? prev.filter(e => e !== id)
                : [...prev, id]
        );
    };

    const toggleObraSocial = (id: string) => {
        setSelectedObrasSociales(prev =>
            prev.includes(id)
                ? prev.filter(o => o !== id)
                : [...prev, id]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                </label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Juan Pérez"
                />
            </div>

            <div>
                <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula
                </label>
                <input
                    type="text"
                    id="matricula"
                    name="matricula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MP 12345"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidades *
                </label>
                {especialidades.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No hay especialidades disponibles. Por favor, crea al menos una especialidad primero.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {especialidades.map((esp) => (
                            <label key={esp.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedEspecialidades.includes(esp.id)}
                                    onChange={() => toggleEspecialidad(esp.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{esp.nombre}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Obras Sociales (opcional)
                </label>
                {obraSociales.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No hay obras sociales disponibles. Puedes crearlas en "Obras Sociales" y volver a este formulario.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {obraSociales.map((os) => (
                            <label key={os.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedObrasSociales.includes(os.id)}
                                    onChange={() => toggleObraSocial(os.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{os.nombre}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting || selectedEspecialidades.length === 0}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Guardando...' : profesional ? 'Actualizar Profesional' : 'Guardar Profesional'}
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
