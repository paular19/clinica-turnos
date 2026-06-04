import 'dotenv/config';
import { prisma } from '../lib/db/prisma';

async function main() {
  const legacyDomingos = await prisma.horario.findMany({
    where: { diaSemana: 0 },
    select: {
      id: true,
      profesional: { select: { nombre: true } },
    },
  });

  if (legacyDomingos.length === 0) {
    console.log('No se encontraron horarios legacy con diaSemana=0.');
    return;
  }

  const profesionales = Array.from(
    new Set(legacyDomingos.map((h) => h.profesional?.nombre).filter(Boolean))
  ) as string[];

  const updated = await prisma.horario.updateMany({
    where: { diaSemana: 0 },
    data: { diaSemana: 7 },
  });

  console.log(`Horarios normalizados: ${updated.count}`);
  console.log(`Profesionales afectados: ${profesionales.length}`);
  for (const nombre of profesionales) {
    console.log(`- ${nombre}`);
  }
}

main()
  .catch((error) => {
    console.error('Error al normalizar diaSemana:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
