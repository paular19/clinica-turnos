import "dotenv/config";
import { Rol } from "@prisma/client";
import { prisma } from "../lib/db/prisma";
import { SHARED_CLINIC_ID } from "../lib/config/clinic";

function getArgValue(flag: string): string | undefined {
    const index = process.argv.indexOf(flag);
    if (index === -1) return undefined;
    return process.argv[index + 1];
}

async function assignProfesionalUser() {
    const clerkId = getArgValue("--clerkId") || "user_397Ydnbl5m73WCFBFQ3ZkYdJafK";
    const profesionalNombre = getArgValue("--nombre") || "Navarrete Ivana";

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { clerkId },
            include: { profesional: true, clinic: true },
        });

        if (!usuario) {
            console.error(`❌ No se encontro el usuario con clerkId ${clerkId}`);
            return;
        }

        const clinicId = usuario.clinicId || SHARED_CLINIC_ID;

        const profesional = await prisma.profesional.findFirst({
            where: {
                clinicId,
                nombre: { equals: profesionalNombre, mode: "insensitive" },
            },
        });

        if (!profesional) {
            console.error(`❌ No se encontro el profesional "${profesionalNombre}" en la clinica ${clinicId}`);
            return;
        }

        if (usuario.profesional && usuario.profesional.id !== profesional.id) {
            console.error(`❌ El usuario ya tiene un profesional asignado (${usuario.profesional.id})`);
            return;
        }

        if (profesional.usuarioId && profesional.usuarioId !== usuario.id) {
            console.error(`❌ El profesional ya esta asignado a otro usuario (${profesional.usuarioId})`);
            return;
        }

        if (usuario.clinicId !== profesional.clinicId) {
            console.error("❌ El usuario y el profesional no pertenecen a la misma clinica");
            console.error(`   Usuario clinicId: ${usuario.clinicId}`);
            console.error(`   Profesional clinicId: ${profesional.clinicId}`);
            return;
        }

        await prisma.$transaction([
            prisma.usuario.update({
                where: { id: usuario.id },
                data: { rol: Rol.MEDICO },
            }),
            prisma.profesional.update({
                where: { id: profesional.id },
                data: { usuarioId: usuario.id },
            }),
        ]);

        console.log("✅ Asignacion completada");
        console.log(`   Profesional: ${profesional.nombre} (${profesional.id})`);
        console.log(`   Usuario: ${usuario.email} (${usuario.id})`);
    } catch (error) {
        console.error("❌ Error al asignar profesional:", error);
    } finally {
        await prisma.$disconnect();
    }
}

assignProfesionalUser();
