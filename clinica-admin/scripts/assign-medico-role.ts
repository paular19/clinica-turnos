import 'dotenv/config';
import { Rol } from '@prisma/client';
import { prisma } from '../lib/db/prisma';

async function assignMedicoRole() {
    const email = 'ficacode@gmail.com';

    try {
        // Buscar el usuario por email
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { profesional: true, clinic: true }
        });

        if (!usuario) {
            console.error(`❌ No se encontró ningún usuario con el email ${email}`);
            console.log('💡 Verifica que el usuario exista en Clerk y se haya registrado en la aplicación');
            return;
        }

        console.log(`✅ Usuario encontrado: ${usuario.nombre} (${usuario.email})`);
        console.log(`   Rol actual: ${usuario.rol}`);
        console.log(`   Clínica: ${usuario.clinic.name}`);

        // Actualizar el rol a MEDICO
        if (usuario.rol !== Rol.MEDICO) {
            await prisma.usuario.update({
                where: { id: usuario.id },
                data: { rol: Rol.MEDICO }
            });
            console.log(`✅ Rol actualizado a MEDICO`);
        } else {
            console.log(`ℹ️  El usuario ya tiene el rol MEDICO`);
        }

        // Verificar si ya tiene un perfil de profesional
        if (!usuario.profesional) {
            console.log(`\n⚠️  El usuario no tiene un perfil de profesional asociado`);
            console.log(`   Creando perfil de profesional...`);

            const profesional = await prisma.profesional.create({
                data: {
                    nombre: usuario.nombre,
                    matricula: `MAT-${Date.now()}`, // Matricula temporal
                    usuarioId: usuario.id,
                    clinicId: usuario.clinicId
                }
            });

            console.log(`✅ Perfil de profesional creado con ID: ${profesional.id}`);
            console.log(`   Matrícula: ${profesional.matricula}`);
            console.log(`\n💡 Recuerda asignar especialidades al profesional desde el panel de administración`);
        } else {
            console.log(`✅ El usuario ya tiene un perfil de profesional asociado`);
            console.log(`   ID Profesional: ${usuario.profesional.id}`);
            console.log(`   Matrícula: ${usuario.profesional.matricula || 'No asignada'}`);
        }

        console.log(`\n✨ Proceso completado exitosamente`);
        console.log(`📌 El usuario ${email} ahora puede acceder al portal médico en /medicos`);

    } catch (error) {
        console.error('❌ Error al asignar el rol:', error);
    } finally {
        await prisma.$disconnect();
    }
}

assignMedicoRole();
