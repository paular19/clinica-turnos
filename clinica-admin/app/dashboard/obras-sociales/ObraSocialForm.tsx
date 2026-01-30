'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createObraSocial, updateObraSocial } from '@/lib/actions/admin';

interface ObraSocial {
    id: string;
    nombre: string;
    activa: boolean;
}

export default function ObraSocialForm({ obraSocial }: { obraSocial?: ObraSocial }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activa, setActiva] = useState(obraSocial?.activa ?? true);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const nombre = formData.get('nombre') as string;

        try {
            if (obraSocial) {
                await updateObraSocial(obraSocial.id, {
                    nombre,
                    activa,
                });
            } else {
                await createObraSocial({
                    nombre,
                    activa,
                });
            }

            router.push('/dashboard/obras-sociales');
            router.refresh();
        } catch (error) {
            alert(`Error al ${obraSocial ? 'actualizar' : 'crear'} la obra social`);
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                </label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    defaultValue={obraSocial?.nombre}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: OSDE, Swiss Medical, etc."
                />
            </div>

            <div>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={activa}
                        onChange={(e) => setActiva(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Obra Social Activa
                    </span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                    Solo las obras sociales activas estarán disponibles para nuevos pacientes
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Guardando...' : obraSocial ? 'Actualizar Obra Social' : 'Guardar Obra Social'}
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
