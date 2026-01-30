import 'dotenv/config';
import { Rol } from '@prisma/client';
import { prisma } from '../lib/db/prisma';

async function setupClinicAndMedico() {
    try {
        // 1. Crear o verificar clínica
        let clinic = await prisma.clinic.findFirst();

        if (!clinic) {
            clinic = await prisma.clinic.create({
                data: {
                    name: 'Clínica Principal',
                    address: 'Dirección de la clínica'
                }
            });
            console.log(`✅ Clínica creada: ${clinic.name}`);
        } else {
            console.log(`✅ Clínica existente: ${clinic.name}`);
        }

        // 2. Buscar usuario por email
        const email = 'ficacode@gmail.com';
        let usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { profesional: true }
        });

        if (usuario) {
            console.log(`✅ Usuario encontrado: ${usuario.nombre}`);

            // Actualizar rol a MEDICO
            if (usuario.rol !== Rol.MEDICO) {
                await prisma.usuario.update({
                    where: { id: usuario.id },
                    data: { rol: Rol.MEDICO }
                });
                console.log(`✅ Rol actualizado a MEDICO`);
            } else {
                console.log(`ℹ️  El usuario ya tiene rol MEDICO`);
            }

            // Crear profesional si no existe
            if (!usuario.profesional) {
                const profesional = await prisma.profesional.create({
                    data: {
                        nombre: usuario.nombre,
                        matricula: `MAT-FICA-${Date.now()}`,
                        usuarioId: usuario.id,
                        clinicId: clinic.id
                    }
                });
                console.log(`✅ Perfil de profesional creado`);
                console.log(`   ID: ${profesional.id}`);
                console.log(`   Matrícula: ${profesional.matricula}`);
            } else {
                console.log(`✅ El usuario ya tiene perfil de profesional`);
                console.log(`   ID: ${usuario.profesional.id}`);
                console.log(`   Matrícula: ${usuario.profesional.matricula || 'No asignada'}`);
            }
        } else {
            console.log(`⚠️  Usuario no encontrado con email: ${email}`);
            console.log(`\nℹ️  El usuario debe iniciar sesión primero en la aplicación`);
            console.log(`   Esto creará automáticamente su registro en la base de datos`);
            console.log(`\n💡 Pasos:`);
            console.log(`   1. Ir a http://localhost:3001/sign-in`);
            console.log(`   2. Iniciar sesión con ${email}`);
            console.log(`   3. Ejecutar este script nuevamente`);
            return;
        }

        console.log(`\n✨ Configuración completada`);
        console.log(`📌 ${email} puede acceder al portal médico en /medicos`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupClinicAndMedico();
