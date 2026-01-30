import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ObraSocialForm from '../ObraSocialForm';

export default async function NuevaObraSocialPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Nueva Obra Social</h1>
                <p className="text-gray-600 mt-2">
                    Registra una nueva obra social en el sistema
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <ObraSocialForm />
            </div>
        </div>
    );
}
