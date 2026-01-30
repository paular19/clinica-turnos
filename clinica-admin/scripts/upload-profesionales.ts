// scripts/upload-profesionales.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const CLINIC_ID = "406fc3e2-342a-4871-b52a-d63f95be4072";

// Mapeo de días a números ISO (Lunes=1, Domingo=7)
const dayMap: Record<string, number> = {
    LUNES: 1,
    MARTES: 2,
    MIÉRCOLES: 3,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
    SÁBADO: 6,
    SABADO: 6,
    DOMINGO: 7,
};

function parseHora(hora: string): string {
    const cleaned = hora.trim().toUpperCase();
    // Ej: "11HS", "18:00", "18.30"
    let time = cleaned.replace(/HS/g, "").trim();
    if (!time.includes(":")) {
        if (time.includes(".")) {
            time = time.replace(".", ":");
        } else {
            time = time + ":00";
        }
    }
    const [h, m] = time.split(/[:\.]/);
    return `${String(h).padStart(2, "0")}:${String(m || "0").padStart(2, "0")}`;
}

interface Profesional {
    nombre: string;
    apellido: string;
    especialidad: string;
    horarios: { dias: string; horaInicio: string; horaFin: string }[];
    obraSociales: string[];
}

const profesionales: Profesional[] = [
    {
        nombre: "Juan José",
        apellido: "Albornoz",
        especialidad: "Cirujano General",
        horarios: [{ dias: "LUNES MARTES JUEVES", horaInicio: "11:00", horaFin: "14:00" }],
        obraSociales: ["CMS", "OSECAC", "IPSS"],
    },
    {
        nombre: "Jorge",
        apellido: "Coronel",
        especialidad: "Cardiólogo",
        horarios: [{ dias: "LUNES MARTES MIÉRCOLES", horaInicio: "18:00", horaFin: "19:00" }],
        obraSociales: ["CMS", "IPSS"],
    },
    {
        nombre: "Rubén",
        apellido: "Brem",
        especialidad: "Médico Familiar",
        horarios: [{ dias: "MARTES JUEVES VIERNES", horaInicio: "18:30", horaFin: "20:00" }],
        obraSociales: ["CMS", "IPSS"],
    },
    {
        nombre: "Guadalupe",
        apellido: "Brunetto",
        especialidad: "Infectóloga",
        horarios: [{ dias: "MARTES JUEVES", horaInicio: "13:30", horaFin: "15:00" }],
        obraSociales: ["CMS", "PIEVE", "IPSS"],
    },
    {
        nombre: "Carlos",
        apellido: "Iglesias",
        especialidad: "Cardiólogo",
        horarios: [{ dias: "JUEVES", horaInicio: "18:00", horaFin: "19:00" }],
        obraSociales: ["CMS", "IPSS"],
    },
    {
        nombre: "Ariel",
        apellido: "Cáceres Zerda",
        especialidad: "Diabetólogo",
        horarios: [
            { dias: "LUNES JUEVES", horaInicio: "16:00", horaFin: "20:00" },
            { dias: "MARTES", horaInicio: "17:00", horaFin: "20:00" },
        ],
        obraSociales: ["CMS", "IPSS"],
    },
    {
        nombre: "Darío",
        apellido: "Cáceres Zerda",
        especialidad: "Traumatólogo",
        horarios: [{ dias: "MARTES", horaInicio: "08:30", horaFin: "10:30" }],
        obraSociales: ["CMS", "IPSS", "PAMI"],
    },
    {
        nombre: "Laura",
        apellido: "Gil",
        especialidad: "Nefróloga",
        horarios: [{ dias: "VIERNES", horaInicio: "14:30", horaFin: "15:30" }],
        obraSociales: ["CMS", "IPSS"],
    },
    {
        nombre: "Gabriel",
        apellido: "Gutiérrez",
        especialidad: "Clínico",
        horarios: [{ dias: "LUNES MARTES MIÉRCOLES VIERNES", horaInicio: "18:30", horaFin: "20:00" }],
        obraSociales: ["IPSS"],
    },
    {
        nombre: "Vanesa",
        apellido: "Mondaque",
        especialidad: "Psiquiatra",
        horarios: [{ dias: "MARTES", horaInicio: "16:30", horaFin: "18:00" }],
        obraSociales: ["OSPE"],
    },
    {
        nombre: "Ivana",
        apellido: "Navarrete",
        especialidad: "Hematóloga",
        horarios: [{ dias: "MARTES MIÉRCOLES JUEVES VIERNES", horaInicio: "09:30", horaFin: "11:00" }],
        obraSociales: ["IPSS", "PAMI", "OSECAC"],
    },
    {
        nombre: "Julio",
        apellido: "Ocampo",
        especialidad: "Traumatólogo",
        horarios: [{ dias: "MIÉRCOLES VIERNES", horaInicio: "08:30", horaFin: "10:30" }],
        obraSociales: ["IPSS", "PAMI", "CMS"],
    },
    {
        nombre: "Alejandro",
        apellido: "Pardo",
        especialidad: "Clínico",
        horarios: [{ dias: "MARTES MIÉRCOLES", horaInicio: "10:30", horaFin: "12:00" }],
        obraSociales: ["IPSS", "CMS"],
    },
    {
        nombre: "Ivana",
        apellido: "Rocha",
        especialidad: "Clínica",
        horarios: [{ dias: "LUNES MARTES MIÉRCOLES JUEVES VIERNES", horaInicio: "13:30", horaFin: "15:00" }],
        obraSociales: ["IPSS", "CMS", "PAMI"],
    },
    {
        nombre: "María",
        apellido: "Salvatierra",
        especialidad: "Nutricionista",
        horarios: [{ dias: "LUNES MARTES MIÉRCOLES VIERNES", horaInicio: "10:30", horaFin: "12:00" }],
        obraSociales: ["IPSS", "CMS"],
    },
];

async function main() {
    console.log("🔄 Iniciando inserción de profesionales...");

    // 1. Crear/verificar especialidades
    const especialidadMap: Record<string, string> = {};
    for (const prof of profesionales) {
        if (!especialidadMap[prof.especialidad]) {
            const spec = await prisma.especialidad.upsert({
                where: { nombre_clinicId: { nombre: prof.especialidad, clinicId: CLINIC_ID } },
                update: {},
                create: {
                    nombre: prof.especialidad,
                    clinicId: CLINIC_ID,
                },
            });
            especialidadMap[prof.especialidad] = spec.id;
            console.log(`✓ Especialidad: ${prof.especialidad}`);
        }
    }

    // 2. Crear/verificar obras sociales
    const obraSocialMap: Record<string, string> = {};
    const uniqueObras = Array.from(new Set(profesionales.flatMap((p) => p.obraSociales)));
    for (const obra of uniqueObras) {
        const os = await prisma.obraSocial.upsert({
            where: { nombre_clinicId: { nombre: obra, clinicId: CLINIC_ID } },
            update: { activa: true },
            create: {
                nombre: obra,
                clinicId: CLINIC_ID,
                activa: true,
            },
        });
        obraSocialMap[obra] = os.id;
        console.log(`✓ Obra Social: ${obra}`);
    }

    // 3. Crear profesionales con horarios y relaciones
    for (const prof of profesionales) {
        const fullName = `${prof.nombre} ${prof.apellido}`;

        const profesional = await prisma.profesional.upsert({
            where: { matricula: fullName }, // Usamos nombre como identificador único
            update: {},
            create: {
                nombre: fullName,
                matricula: fullName,
                clinicId: CLINIC_ID,
            },
        });

        // Conectar especialidad
        await prisma.profesional.update({
            where: { id: profesional.id },
            data: {
                especialidades: {
                    connect: { id: especialidadMap[prof.especialidad] },
                },
            },
        });

        // Crear horarios
        for (const horario of prof.horarios) {
            const dias = horario.dias.split(/[\s]+/).filter((d) => d.length > 0);
            for (const dia of dias) {
                const diaNorm = dia.toUpperCase().replace("Á", "Á");
                const dayNum = dayMap[diaNorm];

                if (dayNum !== undefined) {
                    await prisma.horario.upsert({
                        where: {
                            id: `${profesional.id}-${dayNum}`, // Generamos un ID único
                        },
                        update: {
                            horaInicio: horario.horaInicio,
                            horaFin: horario.horaFin,
                        },
                        create: {
                            id: `${profesional.id}-${dayNum}`,
                            diaSemana: dayNum,
                            horaInicio: horario.horaInicio,
                            horaFin: horario.horaFin,
                            intervaloMin: 30,
                            profesionalId: profesional.id,
                            clinicId: CLINIC_ID,
                        },
                    });
                }
            }
        }

        // Conectar obras sociales
        for (const obra of prof.obraSociales) {
            await prisma.profesionalObraSocial.upsert({
                where: {
                    profesionalId_obraSocialId: {
                        profesionalId: profesional.id,
                        obraSocialId: obraSocialMap[obra],
                    },
                },
                update: {},
                create: {
                    profesionalId: profesional.id,
                    obraSocialId: obraSocialMap[obra],
                    clinicId: CLINIC_ID,
                },
            });
        }

        console.log(`✓ Profesional: ${fullName}`);
    }

    console.log("\n✅ Inserción completada exitosamente!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
