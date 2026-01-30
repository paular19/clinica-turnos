import 'dotenv/config';
import { prisma } from '../lib/db/prisma';

async function listUsers() {
    try {
        const usuarios = await prisma.usuario.findMany({
            include: {
                profesional: true,
                clinic: true
            }
        });

        console.log(`\n📋 Usuarios registrados (${usuarios.length}):\n`);

        if (usuarios.length === 0) {
            console.log('   No hay usuarios registrados en la base de datos.');
            return;
        }

        usuarios.forEach((user, index) => {
            console.log(`${index + 1}. ${user.nombre}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Rol: ${user.rol}`);
            console.log(`   Clínica: ${user.clinic.name}`);
            console.log(`   Profesional: ${user.profesional ? 'Sí (ID: ' + user.profesional.id + ')' : 'No'}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error al listar usuarios:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
