import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export default async function HomePage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    // Obtener usuario de la base de datos para verificar el rol
    const usuarioDb = await prisma.usuario.findUnique({
        where: { clerkId: user.id },
        select: { rol: true },
    });

    if (!usuarioDb) {
        redirect('/sign-in');
    }

    // Redirigir según el rol
    if (usuarioDb.rol === 'MEDICO') {
        redirect('/medicos/turnos');
    } else {
        redirect('/dashboard');
    }
}
