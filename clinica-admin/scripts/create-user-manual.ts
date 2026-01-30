import 'dotenv/config';
import { Rol } from '@prisma/client';
import { prisma } from '../lib/db/prisma';

// Función para crear el usuario manualmente
async function createUserManually() {
    try {
        const clinic = await prisma.clinic.findFirst();
        if (!clinic) {
            console.error('❌ No hay clínica disponible');
            return;
        }

        console.log('📝 Ingresa los datos del usuario:');
        console.log('');

        // Aquí puedes cambiar estos valores manualmente
        const clerkId = process.argv[2] || 'CLERK_ID_AQUI'; // Pasar como argumento
        const email = 'ficacode@gmail.com';
        const nombre = 'Fica Code';

        if (clerkId === 'CLERK_ID_AQUI') {
            console.log('❌ Debes proporcionar el Clerk ID');
            console.log('💡 Uso: npx tsx scripts/create-user-manual.ts <CLERK_ID>');
            console.log('');
            console.log('Para obtener el Clerk ID:');
            console.log('1. Ve a https://dashboard.clerk.com');
            console.log('2. Selecciona tu aplicación');
            console.log('3. Ve a "Users" en el menú lateral');
            console.log('4. Busca el usuario ficacode@gmail.com');
            console.log('5. Copia su User ID (comienza con user_)');
            return;
        }

        // Verificar si ya existe
        const existing = await prisma.usuario.findUnique({
            where: { clerkId }
        });

        if (existing) {
            console.log('✅ Usuario ya existe, actualizando...');
            await prisma.usuario.update({
                where: { id: existing.id },
                data: { rol: Rol.MEDICO }
            });

            const prof = await prisma.profesional.findUnique({
                where: { usuarioId: existing.id }
            });

            if (!prof) {
                const profesional = await prisma.profesional.create({
                    data: {
                        nombre: existing.nombre,
                        matricula: `MAT-${Date.now()}`,
                        usuarioId: existing.id,
                        clinicId: clinic.id
                    }
                });
                console.log(`✅ Profesional creado: ${profesional.id}`);
            }
            console.log('✨ Usuario configurado como médico');
            return;
        }

        // Crear usuario
        const usuario = await prisma.usuario.create({
            data: {
                clerkId,
                nombre,
                email,
                rol: Rol.MEDICO,
                clinicId: clinic.id
            }
        });

        console.log(`✅ Usuario creado: ${usuario.nombre}`);

        // Crear profesional
        const profesional = await prisma.profesional.create({
            data: {
                nombre: usuario.nombre,
                matricula: `MAT-FICA-001`,
                usuarioId: usuario.id,
                clinicId: clinic.id
            }
        });

        console.log(`✅ Profesional creado: ${profesional.id}`);
        console.log(`✅ Matrícula: ${profesional.matricula}`);
        console.log('');
        console.log('✨ Configuración completada exitosamente');
        console.log(`📌 ${email} puede acceder al portal médico en /medicos`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createUserManually();
