"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";

interface FormProps {
    onSubmit: (formData: FormData) => Promise<{ success: boolean; message: string } | undefined>;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl text-white font-semibold bg-[var(--brand-500)] hover:bg-[var(--brand-600)] transition disabled:opacity-50"
        >
            {pending ? "Enviando..." : "Solicitar turno"}
        </button>
    );
}

export default function TurnoForm({ onSubmit }: FormProps) {
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        const result = await onSubmit(formData);
        if (result) {
            setMessage({
                type: result.success ? 'success' : 'error',
                text: result.message
            });
            if (result.success) {
                (document.querySelector('form') as HTMLFormElement)?.reset();
            }
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4 max-w-xl mx-auto">
            <div>
                <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
                <input
                    name="nombre"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm p-3"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm p-3"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Fecha</label>
                    <input
                        name="fecha"
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm p-3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Hora</label>
                    <input
                        name="hora"
                        type="time"
                        required
                        className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm p-3"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Especialidad</label>
                <select
                    name="especialidad"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm p-3"
                >
                    <option value="">Seleccionar...</option>
                    <option>Cardiología</option>
                    <option>Clínica Médica</option>
                    <option>Pediatría</option>
                    <option>Ginecología</option>
                </select>
            </div>

            <div className="pt-2">
                <SubmitButton />
            </div>

            {message && (
                <div className={`text-center text-sm mt-2 p-2 rounded ${message.type === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}
        </form>
    );
}
