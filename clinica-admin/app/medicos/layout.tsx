import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { Calendar, Clock, LogOut } from 'lucide-react';

export default async function MedicosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const usuarioDb = await prisma.usuario.findUnique({
        where: { clerkId: user.id },
        select: { rol: true },
    });

    // Solo permitir acceso a usuarios MEDICO
    if (usuarioDb?.rol === 'ADMIN') {
        redirect('/dashboard');
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                Portal Médico
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/sign-in" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200">
                    <nav className="p-4 space-y-2">
                        <Link
                            href="/medicos/turnos"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Calendar size={20} />
                            <span>Mis Turnos</span>
                        </Link>
                        <Link
                            href="/medicos/horarios"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Clock size={20} />
                            <span>Mis Horarios</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
