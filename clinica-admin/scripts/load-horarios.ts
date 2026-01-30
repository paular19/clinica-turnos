import { prisma } from '@/lib/db/prisma';

const SHARED_CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";

// Mapeo de días: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
const diasMap: Record<string, number> = {
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6,
    'sabado': 6,
    'domingo': 7,
};

const horarios = [
    { nombre: 'Albornoz Juan José', dias: [1, 2, 4], inicio: '11:00', fin: '20:00' },
    { nombre: 'Coronel Jorge', dias: [1, 2, 3], inicio: '18:00', fin: '19:00' },
    { nombre: 'Brem Rubén', dias: [2, 4, 5], inicio: '18:30', fin: '20:00' },
    { nombre: 'Brunetto Guadalupe', dias: [2, 4], inicio: '13:30', fin: '15:00' },
    { nombre: 'Iglesias Carlos', dias: [4], inicio: '18:00', fin: '19:00' },
    { nombre: 'Gil Laura', dias: [5], inicio: '14:30', fin: '15:30' },
    { nombre: 'Gutiérrez Gabriel', dias: [1, 2, 3, 5], inicio: '18:30', fin: '20:00' },
    { nombre: 'Mondaque Vanesa', dias: [2], inicio: '16:30', fin: '18:00' },
    { nombre: 'Navarrete Ivana', dias: [2, 3, 4, 5], inicio: '09:30', fin: '11:00' },
    { nombre: 'Ocampo Julio', dias: [3, 5], inicio: '08:30', fin: '10:30' },
    { nombre: 'Pardo Alejandro', dias: [2, 3], inicio: '10:30', fin: '12:00' },
    { nombre: 'Rocha Ivana', dias: [1, 2, 3, 4, 5], inicio: '13:30', fin: '15:00' },
    { nombre: 'Salvatierra María', dias: [1, 2, 3, 5], inicio: '10:30', fin: '12:00' },
];

async function main() {
    console.log('🔍 Cargando horarios...\n');

    for (const horario of horarios) {
        // Encontrar el profesional por nombre (búsqueda parcial)
        const prof = await prisma.profesional.findFirst({
            where: {
                clinicId: SHARED_CLINIC_ID,
                nombre: { contains: horario.nombre.split(' ')[0] },
            },
        });

        if (!prof) {
            console.log(`⚠️  No se encontró: ${horario.nombre}`);
            continue;
        }

        // Crear un horario por cada día
        for (const dia of horario.dias) {
            await prisma.horario.create({
                data: {
                    diaSemana: dia,
                    horaInicio: horario.inicio,
                    horaFin: horario.fin,
                    intervaloMin: 15,
                    profesionalId: prof.id,
                    clinicId: SHARED_CLINIC_ID,
                },
            });
            console.log(`✅ ${prof.nombre} - ${Object.entries(diasMap).find(([_, v]) => v === dia)?.[0]} ${horario.inicio}-${horario.fin}`);
        }
    }

    console.log('\n✨ Horarios cargados correctamente');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
