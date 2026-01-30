import 'dotenv/config';
import { Rol } from '@prisma/client';
import { prisma } from '../lib/db/prisma';

async function createMedicoUser() {
    const email = 'ficacode@gmail.com';
    const nombre = 'Fica Code';

    try {
        // Buscar si ya existe el usuario
        const existingUser = await prisma.usuario.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log(`✅ El usuario ${email} ya existe`);
            console.log(`   Actualizando a rol MEDICO...`);

            await prisma.usuario.update({
                where: { id: existingUser.id },
                data: { rol: Rol.MEDICO }
            });

            // Verificar si tiene profesional
            const withProfesional = await prisma.usuario.findUnique({
                where: { id: existingUser.id },
                include: { profesional: true, clinic: true }
            });

            if (!withProfesional?.profesional) {
                const profesional = await prisma.profesional.create({
                    data: {
                        nombre: withProfesional!.nombre,
                        matricula: `MAT-${Date.now()}`,
                        usuarioId: withProfesional!.id,
                        clinicId: withProfesional!.clinicId
                    }
                });
                console.log(`✅ Perfil de profesional creado con ID: ${profesional.id}`);
            }

            console.log(`\n✨ Usuario actualizado exitosamente`);
            return;
        }

        // Obtener la primera clínica disponible
        const clinic = await prisma.clinic.findFirst();
        if (!clinic) {
            console.error('❌ No hay clínicas en la base de datos');
            console.log('💡 Debes crear una clínica primero');
            return;
        }

        // Buscar el ClerkId del usuario por su email
        console.log('⚠️  Para crear el usuario necesitas su Clerk ID');
        console.log('💡 El usuario debe iniciar sesión primero en la aplicación para obtener su Clerk ID');
        console.log('   O puedes buscarlo en el dashboard de Clerk: https://dashboard.clerk.com');

        console.log('\nPor ahora, creando con ClerkId temporal...');

        const clerkId = `user_temp_${Date.now()}`;

        // Crear el usuario
        const usuario = await prisma.usuario.create({
            data: {
                clerkId,
                nombre,
                email,
                rol: Rol.MEDICO,
                clinicId: clinic.id
            }
        });

        console.log(`✅ Usuario creado: ${usuario.nombre} (${usuario.email})`);
        console.log(`   ID: ${usuario.id}`);
        console.log(`   Clerk ID: ${usuario.clerkId}`);
        console.log(`   Rol: ${usuario.rol}`);

        // Crear perfil de profesional
        const profesional = await prisma.profesional.create({
            data: {
                nombre: usuario.nombre,
                matricula: `MAT-${Date.now()}`,
                usuarioId: usuario.id,
                clinicId: clinic.id
            }
        });

        console.log(`✅ Perfil de profesional creado con ID: ${profesional.id}`);
        console.log(`   Matrícula: ${profesional.matricula}`);

        console.log(`\n✨ Proceso completado exitosamente`);
        console.log(`⚠️  IMPORTANTE: Debes actualizar el Clerk ID cuando el usuario inicie sesión`);
        console.log(`   Puedes hacer esto ejecutando: UPDATE "Usuario" SET "clerkId" = '<real_clerk_id>' WHERE email = '${email}';`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createMedicoUser();
