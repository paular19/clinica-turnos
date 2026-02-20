import { getPrisma } from '@/lib/db/prisma';

const prisma = getPrisma();

async function updateIntervalo() {
    try {
        console.log('🔄 Actualizando intervalos de horarios a 30 minutos...');

        const result = await prisma.horario.updateMany({
            where: {
                OR: [
                    { intervaloMin: 15 },
                    { intervaloMin: 60 },
                ],
            },
            data: {
                intervaloMin: 30,
            },
        });

        console.log(`✅ Se actualizaron ${result.count} horarios`);

        // Mostrar un resumen
        const totalHorarios = await prisma.horario.count();
        console.log(`📊 Total de horarios en la base de datos: ${totalHorarios}`);

        const conIntervalo30 = await prisma.horario.count({
            where: { intervaloMin: 30 },
        });
        console.log(`✅ Horarios con intervalo de 30 minutos: ${conIntervalo30}`);

    } catch (error) {
        console.error('❌ Error al actualizar intervalos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateIntervalo();
