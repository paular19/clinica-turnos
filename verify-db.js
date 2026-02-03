const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Verificando datos...\n');
  
  const clinics = await prisma.clinic.findMany();
  console.log('Clínicas encontradas:', clinics.length);
  
  for (const clinic of clinics) {
    console.log(`\n--- ${clinic.name} (${clinic.id}) ---`);
    
    const profs = await prisma.profesional.count({ where: { clinicId: clinic.id } });
    const specs = await prisma.especialidad.count({ where: { clinicId: clinic.id } });
    const obras = await prisma.obraSocial.count({ where: { clinicId: clinic.id } });
    
    console.log(`Profesionales: ${profs}`);
    console.log(`Especialidades: ${specs}`);
    console.log(`Obras Sociales: ${obras}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
