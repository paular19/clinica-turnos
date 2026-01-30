import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('=== VERIFICANDO DATOS EN LA BASE DE DATOS ===\n');

    const clinics = await prisma.clinic.findMany({
        select: {
            id: true,
            name: true,
        }
    });

    console.log('📍 Clínicas:', clinics);

    for (const clinic of clinics) {
        console.log(`\n--- Clínica: ${clinic.name} (${clinic.id}) ---`);

        const profesionales = await prisma.profesional.findMany({
            where: { clinicId: clinic.id },
            include: {
                especialidades: true,
                horarios: true,
            }
        });

        console.log(`👨‍⚕️ Profesionales: ${profesionales.length}`);
        profesionales.forEach(prof => {
            console.log(`  - ${prof.nombre} (${prof.id})`);
            console.log(`    Especialidades: ${prof.especialidades.map(e => e.nombre).join(', ') || 'ninguna'}`);
            console.log(`    Horarios: ${prof.horarios.length}`);
        });

        const usuarios = await prisma.usuario.findMany({
            where: { clinicId: clinic.id },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
            }
        });

        console.log(`\n👤 Usuarios: ${usuarios.length}`);
        usuarios.forEach(user => {
            console.log(`  - ${user.nombre} (${user.email}) - ${user.rol}`);
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
