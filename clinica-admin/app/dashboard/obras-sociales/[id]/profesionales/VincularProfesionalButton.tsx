'use client';

import { vincularObraSocial, desvincularObraSocial } from '@/lib/actions/admin';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function VincularProfesionalButton({
    obraSocialId,
    profesionalId,
    isVinculado,
}: {
    obraSocialId: string;
    profesionalId: string;
    isVinculado: boolean;
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = async () => {
        setIsProcessing(true);
        try {
            if (isVinculado) {
                await desvincularObraSocial(profesionalId, obraSocialId);
            } else {
                await vincularObraSocial(profesionalId, obraSocialId);
            }
        } catch (error) {
            alert('Error al procesar la operación');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isVinculado) {
        return (
            <button
                onClick={handleClick}
                disabled={isProcessing}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                title="Desvincular"
            >
                <X size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isProcessing}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors"
            title="Vincular"
        >
            <Plus size={20} />
        </button>
    );
}
