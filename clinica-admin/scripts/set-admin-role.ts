import 'dotenv/config';
import { Rol } from '@prisma/client';
import { prisma } from '../lib/db/prisma';

async function setAdminRole() {
    const clerkId = 'user_39r8bieJgXTwt7wjJaNXBaEOVhG';
    const email = 'clinicasanrafael295@gmail.com';
    const nombre = 'Admin San Rafael';

    try {
        // Buscar el usuario por clerkId
        let usuario = await prisma.usuario.findUnique({
            where: { clerkId },
            include: { clinic: true }
        });

        if (usuario) {
            // Usuario existe, actualizar rol
            console.log(`✅ Usuario encontrado: ${usuario.nombre} (${usuario.email})`);
            console.log(`   Rol actual: ${usuario.rol}`);

            if (usuario.rol !== Rol.ADMIN) {
                await prisma.usuario.update({
                    where: { id: usuario.id },
                    data: { rol: Rol.ADMIN }
                });
                console.log(`✅ Rol actualizado a ADMIN`);
            } else {
                console.log(`ℹ️  El usuario ya tiene rol ADMIN`);
            }
        } else {
            // Usuario no existe, obtener la primera clínica
            console.log(`⚠️  Usuario no encontrado con clerkId ${clerkId}`);
            console.log(`   Creando nuevo usuario...`);

            const clinic = await prisma.clinic.findFirst();
            if (!clinic) {
                console.error('❌ No hay clínicas en la base de datos');
                console.log('💡 Debes crear una clínica primero');
                return;
            }

            usuario = await prisma.usuario.create({
                data: {
                    clerkId,
                    nombre,
                    email,
                    rol: Rol.ADMIN,
                    clinicId: clinic.id
                }
            });

            console.log(`✅ Usuario creado con rol ADMIN`);
            console.log(`   Nombre: ${usuario.nombre}`);
            console.log(`   Email: ${usuario.email}`);
            console.log(`   Clínica: ${clinic.name}`);
        }

        console.log(`\n✨ Proceso completado exitosamente`);
        console.log(`📌 El usuario ${email} ahora tiene acceso administrativo completo`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setAdminRole();
