'use client';

import { deleteHorario } from '@/lib/actions/admin';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeleteHorarioButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteHorario(id);
        } catch (error) {
            alert('Error al eliminar el horario');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
            <Trash2 size={16} />
        </button>
    );
}
