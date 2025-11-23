import { prisma } from "../db/prisma";

export async function listPacientes(clinicId: string, page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;
  const where: any = { clinicId };
  if (search) {
    where.OR = [
      { dni: { contains: search } },
      { nombre: { contains: search, mode: "insensitive" } },
      { apellido: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ];
  }

  const [data, total] = await Promise.all([
    prisma.paciente.findMany({ where, orderBy: { apellido: "asc" }, skip, take: limit }),
    prisma.paciente.count({ where })
  ]);

  return { data, total, page, limit };
}

export async function getPacienteById(id: string, clinicId: string) {
  return prisma.paciente.findFirst({ where: { id, clinicId } });
}
