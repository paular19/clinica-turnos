'use client';

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
    size = 24,
    message = 'Cargando...'
}: {
    size?: number;
    message?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="animate-spin text-blue-600" size={size} />
            {message && (
                <p className="mt-4 text-sm text-gray-600">{message}</p>
            )}
        </div>
    );
}
