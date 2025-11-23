import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Simple seed: create a default clinic if env CLERK_ORG_ID provided
  const tenantId = process.env.CLERK_ORG_ID || null;
  if (!tenantId) {
    console.log("No CLERK_ORG_ID provided. Skipping clinic seed.");
    return;
  }

  let clinic = await prisma.clinic.findUnique({ where: { tenantId } });
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        tenantId,
        name: process.env.CLINIC_NAME || "Mi Clínica",
        address: process.env.CLINIC_ADDRESS || ""
      }
    });
    console.log("Created clinic", clinic.id);
  } else {
    console.log("Clinic already exists", clinic.id);
  }

  // create default configuracion if not exists
  const config = await prisma.configuracion.findUnique({ where: { clinicId: clinic.id } });
  if (!config) {
    await prisma.configuracion.create({
      data: { anticipacionMin: 30, intervaloDefault: 15, clinicId: clinic.id }
    });
    console.log("Created default configuracion");
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
