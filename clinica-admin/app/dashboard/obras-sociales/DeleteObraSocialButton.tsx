'use client';

import { deleteObraSocial } from '@/lib/actions/admin';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeleteObraSocialButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta obra social?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteObraSocial(id);
        } catch (error) {
            alert('Error al eliminar la obra social');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
            <Trash2 size={18} />
        </button>
    );
}
