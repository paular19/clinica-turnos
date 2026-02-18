import 'dotenv/config';
import { prisma } from '../lib/db/prisma';

async function checkUserRole() {
    const clerkId = 'user_39r8bieJgXTwt7wjJaNXBaEOVhG';

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { clerkId },
            include: {
                clinic: true,
                profesional: true
            }
        });

        if (!usuario) {
            console.log('❌ Usuario NO encontrado en la base de datos');
            console.log(`   ClerkId buscado: ${clerkId}`);
            console.log('\n💡 El usuario debe registrarse o ser creado manualmente');
            return;
        }

        console.log('✅ Usuario encontrado:\n');
        console.log(`   Nombre: ${usuario.nombre}`);
        console.log(`   Email: ${usuario.email}`);
        console.log(`   Rol: ${usuario.rol}`);
        console.log(`   Clínica: ${usuario.clinic.name}`);
        console.log(`   ClerkId: ${usuario.clerkId}`);

        if (usuario.profesional) {
            console.log(`   Es profesional: Sí (Matrícula: ${usuario.profesional.matricula || 'N/A'})`);
        } else {
            console.log(`   Es profesional: No`);
        }

        if (usuario.rol === 'ADMIN') {
            console.log('\n✨ El usuario tiene permisos de ADMINISTRADOR');
        } else {
            console.log(`\n⚠️  El usuario tiene rol ${usuario.rol} (NO es administrador)`);
        }

    } catch (error) {
        console.error('❌ Error al consultar usuario:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserRole();
