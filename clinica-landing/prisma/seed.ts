// prisma/seed.ts
import { PrismaClient, Rol } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en el .env");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Lunes=1 ... Domingo=7 (como tu isoDow)
const DOW: Record<string, number> = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  MIÉRCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  SÁBADO: 6,
  DOMINGO: 7,
};

function t(hhmm: string) {
  const [h, m] = hhmm.split(":");
  const hh = String(Number(h)).padStart(2, "0");
  const mm = String(Number(m ?? "0")).padStart(2, "0");
  return `${hh}:${mm}`;
}

async function main() {
  // 1) Clínica: buscar por nombre (no hay unique), crear si no existe
  const clinicName = "Clínica San Rafael";
  let clinic = await prisma.clinic.findFirst({ where: { name: clinicName } });

  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: { name: clinicName, address: "Dirección Seed" },
    });
  } else {
    clinic = await prisma.clinic.update({
      where: { id: clinic.id },
      data: { address: clinic.address ?? "Dirección Seed" },
    });
  }

  await prisma.configuracion.upsert({
    where: { clinicId: clinic.id },
    update: { anticipacionMin: 60, intervaloDefault: 30 },
    create: { clinicId: clinic.id, anticipacionMin: 60, intervaloDefault: 30 },
  });

  // 2) Obras sociales
  const obrasSociales = ["CMS", "OSECAC", "IPSS", "PIEVE", "PAMI", "OSPE"];

  const obraByNombre = new Map<string, { id: string; nombre: string }>();
  for (const nombre of obrasSociales) {
    const row = await prisma.obraSocial.upsert({
      where: { nombre_clinicId: { nombre, clinicId: clinic.id } },
      update: { activa: true },
      create: { nombre, activa: true, clinicId: clinic.id },
      select: { id: true, nombre: true },
    });
    obraByNombre.set(row.nombre, row);
  }

  // 3) Especialidades
  const especialidades = [
    "Cirugía General",
    "Cardiología",
    "Medicina Familiar",
    "Infectología",
    "Diabetología",
    "Traumatología",
    "Nefrología",
    "Clínica Médica",
    "Psiquiatría",
    "Hematología",
    "Nutrición",
  ];

  const especByNombre = new Map<string, { id: string; nombre: string }>();
  for (const nombre of especialidades) {
    const row = await prisma.especialidad.upsert({
      where: { nombre_clinicId: { nombre, clinicId: clinic.id } },
      update: {},
      create: { nombre, clinicId: clinic.id },
      select: { id: true, nombre: true },
    });
    especByNombre.set(row.nombre, row);
  }

  // 4) Profesionales
  const profesionales = [
    {
      nombre: "Albornoz Juan José",
      matricula: "MP-SEED-0001",
      especialidad: "Cirugía General",
      obras: ["CMS", "OSECAC", "IPSS"],
      horarios: [{ dias: ["LUNES", "MARTES", "JUEVES"], desde: "11:00", hasta: "20:00", intervaloMin: 60 }],
    },
    {
      nombre: "Coronel Jorge",
      matricula: "MP-SEED-0002",
      especialidad: "Cardiología",
      obras: ["CMS", "IPSS"],
      horarios: [{ dias: ["LUNES", "MARTES", "MIERCOLES"], desde: "18:00", hasta: "22:00", intervaloMin: 60 }],
    },
    {
      nombre: "Brem Rubén",
      matricula: "MP-SEED-0003",
      especialidad: "Medicina Familiar",
      obras: ["CMS", "IPSS"],
      horarios: [{ dias: ["MARTES", "JUEVES", "VIERNES"], desde: "18:00", hasta: "21:00", intervaloMin: 60 }],
    },
    {
      nombre: "Brunetto Guadalupe",
      matricula: "MP-SEED-0004",
      especialidad: "Infectología",
      obras: ["CMS", "PIEVE", "IPSS"],
      horarios: [{ dias: ["MARTES", "JUEVES"], desde: "13:00", hasta: "17:00", intervaloMin: 60 }],
    },
    {
      nombre: "Iglesias Carlos",
      matricula: "MP-SEED-0005",
      especialidad: "Cardiología",
      obras: ["CMS", "IPSS"],
      horarios: [{ dias: ["JUEVES"], desde: "18:00", hasta: "21:00", intervaloMin: 60 }],
    },
    {
      nombre: "Cáceres Zerda Ariel",
      matricula: "MP-SEED-0006",
      especialidad: "Diabetología",
      obras: ["CMS", "IPSS"],
      horarios: [
        { dias: ["LUNES", "JUEVES"], desde: "16:00", hasta: "20:00", intervaloMin: 60 },
        { dias: ["MARTES"], desde: "17:00", hasta: "20:00", intervaloMin: 60 },
      ],
    },
    {
      nombre: "Cáceres Zerda Darío",
      matricula: "MP-SEED-0007",
      especialidad: "Traumatología",
      obras: ["CMS", "IPSS", "PAMI"],
      horarios: [{ dias: ["MARTES"], desde: "08:00", hasta: "12:00", intervaloMin: 60 }],
    },
    {
      nombre: "Gil Laura",
      matricula: "MP-SEED-0008",
      especialidad: "Nefrología",
      obras: ["CMS", "IPSS"],
      horarios: [{ dias: ["VIERNES"], desde: "14:00", hasta: "18:00", intervaloMin: 60 }],
    },
    {
      nombre: "Gutiérrez Gabriel",
      matricula: "MP-SEED-0009",
      especialidad: "Clínica Médica",
      obras: ["IPSS"],
      horarios: [{ dias: ["LUNES", "MARTES", "MIERCOLES", "VIERNES"], desde: "18:00", hasta: "21:00", intervaloMin: 60 }],
    },
    {
      nombre: "Mondaque Vanesa",
      matricula: "MP-SEED-0010",
      especialidad: "Psiquiatría",
      obras: ["OSPE"],
      horarios: [{ dias: ["MARTES"], desde: "16:00", hasta: "20:00", intervaloMin: 60 }],
    },
    {
      nombre: "Navarrete Ivana",
      matricula: "MP-SEED-0011",
      especialidad: "Hematología",
      obras: ["IPSS", "PAMI", "OSECAC"],
      horarios: [{ dias: ["MARTES", "MIERCOLES", "JUEVES", "VIERNES"], desde: "09:00", hasta: "12:00", intervaloMin: 60 }],
    },
    {
      nombre: "Ocampo Julio",
      matricula: "MP-SEED-0012",
      especialidad: "Traumatología",
      obras: ["IPSS", "PAMI", "CMS"],
      horarios: [{ dias: ["MIERCOLES", "VIERNES"], desde: "08:00", hasta: "12:00", intervaloMin: 60 }],
    },
    {
      nombre: "Pardo Alejandro",
      matricula: "MP-SEED-0013",
      especialidad: "Clínica Médica",
      obras: ["IPSS", "CMS"],
      horarios: [{ dias: ["MARTES", "MIERCOLES"], desde: "10:00", hasta: "13:00", intervaloMin: 60 }],
    },
    {
      nombre: "Rocha Ivana",
      matricula: "MP-SEED-0014",
      especialidad: "Clínica Médica",
      obras: ["IPSS", "CMS", "PAMI"],
      horarios: [{ dias: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"], desde: "13:00", hasta: "17:00", intervaloMin: 60 }],
    },
    {
      nombre: "Salvatierra María",
      matricula: "MP-SEED-0015",
      especialidad: "Nutrición",
      obras: ["IPSS", "CMS"],
      horarios: [{ dias: ["LUNES", "MARTES", "MIERCOLES", "VIERNES"], desde: "10:00", hasta: "13:00", intervaloMin: 60 }],
    },
  ] as const;

  for (const p of profesionales) {
    const email = `${p.nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "")}@demo.com`;

    const clerkId = `seed_${p.matricula}`;

    const user = await prisma.usuario.upsert({
      where: { clerkId },
      update: { nombre: p.nombre, email, rol: Rol.MEDICO, clinicId: clinic.id },
      create: { clerkId, nombre: p.nombre, email, rol: Rol.MEDICO, clinicId: clinic.id },
      select: { id: true },
    });

    const profesional = await prisma.profesional.upsert({
      where: { matricula: p.matricula },
      update: {
        nombre: p.nombre,
        usuarioId: user.id,
        clinicId: clinic.id,
        especialidades: {
          set: [],
          connect: [{ id: especByNombre.get(p.especialidad)!.id }],
        },
      },
      create: {
        nombre: p.nombre,
        matricula: p.matricula,
        usuarioId: user.id,
        clinicId: clinic.id,
        especialidades: { connect: [{ id: especByNombre.get(p.especialidad)!.id }] },
      },
      select: { id: true },
    });

    await prisma.profesionalObraSocial.createMany({
      data: p.obras.map((obraNombre) => ({
        profesionalId: profesional.id,
        obraSocialId: obraByNombre.get(obraNombre)!.id,
        clinicId: clinic.id,
      })),
      skipDuplicates: true,
    });

    await prisma.horario.deleteMany({
      where: { clinicId: clinic.id, profesionalId: profesional.id },
    });

    const rows: {
      clinicId: string;
      profesionalId: string;
      diaSemana: number;
      horaInicio: string;
      horaFin: string;
      intervaloMin: number;
    }[] = [];

    for (const h of p.horarios) {
      for (const dia of h.dias) {
        const diaSemana = DOW[dia];
        if (!diaSemana) throw new Error(`Día inválido: ${dia} (${p.nombre})`);

        rows.push({
          clinicId: clinic.id,
          profesionalId: profesional.id,
          diaSemana,
          horaInicio: t(h.desde),
          horaFin: t(h.hasta),
          intervaloMin: h.intervaloMin,
        });
      }
    }

    await prisma.horario.createMany({ data: rows });
  }

  console.log("✅ Seed OK");
  console.log("ClinicId:", clinic.id);
  console.log("Profesionales creados:", profesionales.length);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
