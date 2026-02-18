import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Clock,
    Building2,
    UserCog,
    CalendarX
} from 'lucide-react';

export default async function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const usuarioDb = await prisma.usuario.findUnique({
        where: { clerkId: user.id },
        select: { rol: true },
    });

    // Solo permitir acceso a usuarios ADMIN
    if (usuarioDb?.rol === 'MEDICO') {
        redirect('/medicos/turnos');
    }
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="p-6">
                    <Link href="/dashboard" className="inline-flex items-center">
                        <Image
                            src="/assets/logo-clinica.png"
                            alt="Clinica"
                            width={260}
                            height={96}
                            className="h-14 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>

                <nav className="px-4 space-y-2">
                    <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />}>
                        Dashboard
                    </NavLink>
                    <NavLink href="/dashboard/profesionales" icon={<UserCog size={20} />}>
                        Profesionales
                    </NavLink>
                    <NavLink href="/dashboard/obras-sociales" icon={<Building2 size={20} />}>
                        Obras Sociales
                    </NavLink>
                    <NavLink href="/dashboard/horarios" icon={<Clock size={20} />}>
                        Horarios
                    </NavLink>
                    <NavLink href="/dashboard/horarios/bloqueos" icon={<CalendarX size={20} />}>
                        Días Bloqueados
                    </NavLink>
                    <NavLink href="/dashboard/turnos" icon={<Calendar size={20} />}>
                        Turnos
                    </NavLink>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">

                        </h2>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavLink({
    href,
    icon,
    children
}: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
            {icon}
            <span className="font-medium">{children}</span>
        </Link>
    );
}
