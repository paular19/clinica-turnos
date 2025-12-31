import { getPrisma } from "@/lib/db/prisma";
const prisma = getPrisma();


export async function listProfesionales(clinicId: string, page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;
  const where: any = { clinicId };
  if (search) where.nombre = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.profesional.findMany({
      where,
      include: { especialidades: true },
      orderBy: { nombre: "asc" },
      skip,
      take: limit,
    }),
    prisma.profesional.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getProfesionalById(id: string, clinicId: string) {
  return prisma.profesional.findFirst({
    where: { id, clinicId },
    include: { horarios: true, especialidades: true, usuario: true, obraSociales: { include: { obraSocial: true } } },
  });
}
