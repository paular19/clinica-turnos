import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

export default async function DebugUserPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    // Buscar si el usuario existe en la BD
    const dbUser = await prisma.usuario.findUnique({
        where: { clerkId: user.id },
        include: { profesional: true, clinic: true }
    });

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Información del Usuario (Debug)</h1>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-lg mb-4">Datos de Clerk:</h2>
                    <div className="space-y-2 font-mono text-sm bg-gray-50 p-4 rounded">
                        <div><strong>Clerk ID:</strong> {user.id}</div>
                        <div><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</div>
                        <div><strong>Nombre:</strong> {user.firstName} {user.lastName}</div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h2 className="font-semibold text-lg mb-4">Datos en Base de Datos:</h2>
                    {dbUser ? (
                        <div className="space-y-2 font-mono text-sm bg-green-50 p-4 rounded">
                            <div><strong>✅ Usuario registrado</strong></div>
                            <div><strong>ID BD:</strong> {dbUser.id}</div>
                            <div><strong>Email:</strong> {dbUser.email}</div>
                            <div><strong>Nombre:</strong> {dbUser.nombre}</div>
                            <div><strong>Rol:</strong> {dbUser.rol}</div>
                            <div><strong>Clínica:</strong> {dbUser.clinic.name}</div>
                            {dbUser.profesional && (
                                <div className="mt-2 pt-2 border-t border-green-200">
                                    <div><strong>✅ Tiene perfil de profesional</strong></div>
                                    <div><strong>ID Profesional:</strong> {dbUser.profesional.id}</div>
                                    <div><strong>Matrícula:</strong> {dbUser.profesional.matricula || 'No asignada'}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-4 rounded">
                            <p className="text-yellow-800 font-semibold">⚠️ Usuario NO registrado en la base de datos</p>
                            <p className="text-sm mt-2">Ejecuta el siguiente comando para crear el usuario:</p>
                            <code className="block mt-2 bg-gray-900 text-white p-2 rounded text-xs">
                                npx tsx scripts/create-user-manual.ts {user.id}
                            </code>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
