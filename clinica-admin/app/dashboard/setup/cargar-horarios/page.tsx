import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LoadHorariosForm from './LoadHorariosForm';

export default async function LoadHorariosPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Cargar Horarios</h1>
                <p className="text-gray-600 mt-2">
                    Haz click para cargar automáticamente todos los horarios de los médicos
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <LoadHorariosForm />
            </div>
        </div>
    );
}
